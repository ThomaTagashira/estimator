// hooks/useDynamicTable.js
import { useState, useEffect, useRef } from 'react';
import { exportPDF } from '../components/utils/exportPDF';
import { resizeImage } from '../components/utils/logoResize';

const useDynamicTable = (selectedString) => {
    const [inputFields, setInputFields] = useState(() => {
        const savedInputFields = localStorage.getItem('dynamicTableInputFields');
        return savedInputFields ? JSON.parse(savedInputFields) : [];
    });

    const [tableData, setTableData] = useState(() => {
        const savedTableData = localStorage.getItem('dynamicTableData');
        return savedTableData ? JSON.parse(savedTableData) : [];
    });

    const [editIndex, setEditIndex] = useState(null);
    const [editValues, setEditValues] = useState({ job: '', laborCost: '', materialCost: '' });
    const [salesTaxPercent, setSalesTaxPercent] = useState(0);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [applyDiscount, setApplyDiscount] = useState(false);
    const [marginPercent, setMarginPercent] = useState(0);
    const [applyMargin, setApplyMargin] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [estimateNumber, setEstimateNumber] = useState('');
    const [logo, setLogo] = useState(null);
    const [clientName, setClientName] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [projectName, setProjectName] = useState('');
    const [projectLocation, setProjectLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const tableRef = useRef();

    // Save input fields to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('dynamicTableInputFields', JSON.stringify(inputFields));
    }, [inputFields]);

    // Save table data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('dynamicTableData', JSON.stringify(tableData));
    }, [tableData]);

    // Whenever a new selectedString is provided, add it as a new input field
    useEffect(() => {
        if (selectedString) {
            setInputFields((prevFields) => [...prevFields, selectedString]);
        }
    }, [selectedString]);

    const handleInputChange = (index, value) => {
        const updatedFields = [...inputFields];
        updatedFields[index] = value;
        setInputFields(updatedFields);
      };

    const handleAddAllRows = () => {
        const newTasks = inputFields.filter((value) => value.trim() !== '');
        setTableData((prevTableData) => [...prevTableData, ...newTasks]);
        setInputFields([]); // Clear all input fields
    };

    const handleAddCustomRow = () => {
        const customRow = 'Custom Job Labor Cost: $0.00 Material Cost: $0.00';
        setTableData((prevTableData) => [...prevTableData, customRow]);
    };

    const handleRemoveField = (index) => {
        const updatedFields = inputFields.filter((_, i) => i !== index);
        setInputFields(updatedFields);
      };

    const handleDeleteRow = (index) => {
        const newTableData = tableData.filter((_, i) => i !== index);
        setTableData(newTableData);
      };

      const handleEditClick = (index) => {
        setEditIndex(index);
        const { job, laborCost, materialCost } = splitTaskIntoColumns(tableData[index]);
        setEditValues({ job, laborCost: laborCost.replace('$', ''), materialCost: materialCost.replace('$', '') });
      };

      const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditValues({ ...editValues, [name]: value });
      };

      const handleUpdateClick = (index) => {
        const { job, laborCost, materialCost } = splitTaskIntoColumns(tableData[index]);

        const updatedJob = editValues.job || job;
        const updatedLaborCost = editValues.laborCost !== '' ? parseFloat(editValues.laborCost).toFixed(2) : laborCost.replace('$', '');
        const updatedMaterialCost = editValues.materialCost !== '' ? parseFloat(editValues.materialCost).toFixed(2) : materialCost.replace('$', '');

        const updatedTask = `${updatedJob} Labor Cost: $${updatedLaborCost} Material Cost: $${updatedMaterialCost}`;
        const newTableData = tableData.map((item, i) => (i === index ? updatedTask : item));
        setTableData(newTableData);
        setEditIndex(null);
      };
    const handleSalesTaxChange = (event) => setSalesTaxPercent(parseFloat(event.target.value) || 0);
    const handleDiscountChange = (event) => setDiscountPercent(parseFloat(event.target.value) || 0);

    const toggleDiscount = () => {
        setApplyDiscount(!applyDiscount);
      };

    const handleMarginChange = (event) => {
        const value = event.target.value;
        setMarginPercent(value ? parseFloat(value) : 0);
      };

    const toggleMargin = () => {
        setApplyMargin(!applyMargin);
      };

    const handleLogoUpload = (event) => {
        const file = event.target.files[0];
        resizeImage(file, 50, 50, (resizedImage) => setLogo(resizedImage));
    };
    const splitTaskIntoColumns = (task) => {
        const laborCostIndex = task.indexOf('Labor Cost:');
        const materialCostIndex = task.indexOf('Material Cost:');

        const job = task.substring(0, Math.min(
            laborCostIndex !== -1 ? laborCostIndex : task.length,
            materialCostIndex !== -1 ? materialCostIndex : task.length
        )).trim();

        let laborCost = '';
        if (laborCostIndex !== -1) {
            const laborCostMatch = task.substring(laborCostIndex).match(/Labor Cost: \$([\d.]+)/);
            if (laborCostMatch) {
                laborCost = parseFloat(laborCostMatch[1]).toFixed(2); // Removed the $ sign
            }
        }

        let materialCost = '';
        if (materialCostIndex !== -1) {
            const materialCostMatch = task.substring(materialCostIndex).match(/Material Cost: \$([\d.]+)/);
            if (materialCostMatch) {
                materialCost = parseFloat(materialCostMatch[1]).toFixed(2); // Removed the $ sign
            }
        }

        return {
            job,
            laborCost: laborCost || '0.00',
            materialCost: materialCost || '0.00'
        };
    };

    const applyMarginToLaborCost = (laborCost) => {
        const cost = parseFloat(laborCost.replace('$', '')) || 0;
        const marginAmount = cost * (marginPercent / 100);
        return (cost + marginAmount).toFixed(2);
      };

    // Function to calculate totals
    const calculateTotals = () => {
        if (!tableData || tableData.length === 0) {
            return {
                totalLaborCost: '0.00',
                totalMaterialCost: '0.00',
                combinedTotal: '0.00',
                totalDiscount: '0.00',
                totalSalesTax: '0.00',
                grandTotal: '0.00'
            };
        }

        // Perform actual calculations here
        let totalLaborCost = 0;
        let totalMaterialCost = 0;

        tableData.forEach((item) => {
            const { laborCost, materialCost } = splitTaskIntoColumns(item);
            const adjustedLaborCost = applyMargin ? applyMarginToLaborCost(laborCost) : laborCost.replace('$', '');
            totalLaborCost += parseFloat(adjustedLaborCost || 0);
            totalMaterialCost += parseFloat(materialCost.replace('$', '') || 0);
        });

        const combinedTotal = totalLaborCost + totalMaterialCost;
        const totalDiscount = applyDiscount ? combinedTotal * (discountPercent / 100) : 0;
        const totalSalesTax = (combinedTotal - totalDiscount) * (salesTaxPercent / 100);
        const grandTotal = combinedTotal - totalDiscount + totalSalesTax;

        return {
            totalLaborCost: totalLaborCost.toFixed(2),
            totalMaterialCost: totalMaterialCost.toFixed(2),
            combinedTotal: combinedTotal.toFixed(2),
            totalDiscount: totalDiscount.toFixed(2),
            totalSalesTax: totalSalesTax.toFixed(2),
            grandTotal: grandTotal.toFixed(2),
        };
    };

    const exportTablePDF = () => {
        const totals = calculateTotals();

        exportPDF({
            logo,
            companyName,
            address,
            phone,
            estimateNumber,
            clientName,
            clientAddress,
            clientPhone,
            clientEmail,
            projectName,
            projectLocation,
            startDate,
            endDate,
            totalLaborCost: totals.totalLaborCost,
            totalMaterialCost: totals.totalMaterialCost,
            combinedTotal: totals.combinedTotal,
            discountPercent,
            totalDiscount: totals.totalDiscount,
            salesTaxPercent,
            totalSalesTax: totals.totalSalesTax,
            grandTotal: totals.grandTotal,
            tableData: tableData.map((item) => {
                const { job, laborCost, materialCost } = splitTaskIntoColumns(item);
                const adjustedLaborCost = applyMargin ? applyMarginToLaborCost(laborCost) : laborCost;
                return { job, laborCost: `$${adjustedLaborCost}`, materialCost: `$${materialCost}` };
            }),
            applyDiscount
        });
    };

    const { totalLaborCost, totalMaterialCost, combinedTotal, totalDiscount, totalSalesTax, grandTotal } = calculateTotals();




      return {
        inputFields,
        tableData,
        editIndex,
        editValues,
        salesTaxPercent,
        discountPercent,
        applyDiscount,
        applyMargin,
        marginPercent,
        logo,
        companyName,
        address,
        phone,
        estimateNumber,
        clientName,
        clientAddress,
        clientPhone,
        clientEmail,
        projectName,
        projectLocation,
        startDate,
        endDate,
        tableRef,
        totalLaborCost,
        totalMaterialCost,
        combinedTotal,
        totalDiscount,
        totalSalesTax,
        grandTotal,
        exportTablePDF,
        handleAddAllRows,
        handleAddCustomRow,
        handleSalesTaxChange,
        handleDiscountChange,
        handleLogoUpload,
        calculateTotals,
        setEditValues,
        setInputFields,
        setTableData,
        setCompanyName,
        setAddress,
        setPhone,
        setEstimateNumber,
        setClientName,
        setClientAddress,
        setClientPhone,
        setClientEmail,
        setProjectName,
        setProjectLocation,
        setStartDate,
        setEndDate,
        handleInputChange,
        handleRemoveField,
        handleDeleteRow,
        handleEditClick,
        handleEditChange,
        handleUpdateClick,
        toggleDiscount,
        handleMarginChange,
        toggleMargin,
        splitTaskIntoColumns,
        applyMarginToLaborCost,
    };
};

export default useDynamicTable;
