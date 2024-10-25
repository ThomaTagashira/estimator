import { useState, useEffect, useRef } from 'react';
import { exportPDF } from '../components/utils/exportPDF';
import { resizeImage } from '../components/utils/logoResize';
import axios from 'axios';

const useDynamicTable = (apiUrl, estimateId, selectedString, setSelectedString ) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputFields, setInputFields] = useState([]);
    const [tableData, setTableData] = useState([]);
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
    const [clientName, setClientName] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [projectName, setProjectName] = useState('');
    const [projectLocation, setProjectLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [originalClientData, setOriginalClientData] = useState(null);
    const [originalProjectData, setOriginalProjectData] = useState(null);
    const [logo, setLogo] = useState(null);
    const tableRef = useRef();

    useEffect(() => {
        const fetchEstimateData = async () => {
            if (!estimateId) return;

            try {
                const accessToken = localStorage.getItem('access_token');
                const response = await fetch(`${apiUrl}/api/saved-estimates/${estimateId}/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setClientName(data.client_data.client_name);
                setClientAddress(data.client_data.client_address);
                setClientPhone(data.client_data.client_phone);
                setClientEmail(data.client_data.client_email);
                setProjectName(data.project_data.project_name);
                setProjectLocation(data.project_data.project_location);
                setStartDate(data.project_data.start_date);
                setEndDate(data.project_data.end_date);

                setOriginalClientData(data.client_data);
                setOriginalProjectData(data.project_data);
            } catch (error) {
                console.error('Failed to fetch estimate data:', error);
            }
        };

        fetchEstimateData();
    }, [estimateId, apiUrl]);

    // Save the updated client and project data
    const saveEstimateData = async () => {
        const accessToken = localStorage.getItem('access_token');

        const clientDataChanged = (
            clientName !== originalClientData.client_name ||
            clientAddress !== originalClientData.client_address ||
            clientPhone !== originalClientData.client_phone ||
            clientEmail !== originalClientData.client_email
        );

        const projectDataChanged = (
            projectName !== originalProjectData.project_name ||
            projectLocation !== originalProjectData.project_location ||
            startDate !== originalProjectData.start_date ||
            endDate !== originalProjectData.end_date
        );

        try {
            if (clientDataChanged || projectDataChanged) {
                const requestBody = {
                    client_data: {
                        client_name: clientName,
                        client_address: clientAddress,
                        client_phone: clientPhone,
                        client_email: clientEmail,
                    },
                    project_data: {
                        project_name: projectName,
                        project_location: projectLocation,
                        start_date: startDate,
                        end_date: endDate,
                    },
                };

                const response = await fetch(`${apiUrl}/api/update-estimate/${estimateId}/`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                if (response.ok) {
                    console.log('Estimate data saved successfully.');
                    setOriginalClientData({
                        client_name: clientName,
                        client_address: clientAddress,
                        client_phone: clientPhone,
                        client_email: clientEmail,
                    });
                    setOriginalProjectData({
                        project_name: projectName,
                        project_location: projectLocation,
                        start_date: startDate,
                        end_date: endDate,
                    });
                } else {
                    console.error('Failed to save estimate data.');
                }
            } else {
                console.log('No changes detected.');
            }
        } catch (error) {
            console.error('Error saving estimate data:', error);
        }
    };



    const toggleEdit = () => setIsEditing(!isEditing);

    const handleUpdate = async () => {
        try {
            const response = await fetch('/api/update-client-data/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientName,
                    clientAddress,
                    clientPhone,
                    clientEmail,
                    projectName,
                    projectLocation,
                    startDate,
                    endDate,
                    companyName,
                    address,
                    phone,
                }),
            });
            if (response.ok) {
                console.log('Data updated successfully');
            } else {
                console.error('Failed to update data');
            }
        } catch (error) {
            console.error('Error updating data:', error);
        }
        setIsEditing(false);
    };


    useEffect(() => {
        if (selectedString) {
          setInputFields((prevFields) => [...prevFields, selectedString]);
          setSelectedString('');
        }
      }, [selectedString, inputFields]);

    const handleInputChange = (index, value) => {
        const updatedFields = [...inputFields];
        updatedFields[index] = value;
        setInputFields(updatedFields);
    };

    const handleAddAllRows = async () => {
        const newTasks = inputFields.filter((value) => value.trim() !== '');

        const tasksToSave = newTasks.map(task => splitTaskIntoColumns(task));

        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch(`${apiUrl}/api/save-estimate-items/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    estimate_id: estimateId,
                    tasks: tasksToSave
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save tasks');
            }

            console.log('Tasks saved to database');
            setTableData((prevTableData) => [...prevTableData, ...newTasks]);
            setInputFields([]);

        } catch (error) {
            console.error('Error saving tasks:', error);
        }

         localStorage.removeItem('selectedStrings');
    };



    const handleAddCustomRow = () => {
        const customRow = 'Custom Job Labor Cost: $0.00 Material Cost: $0.00';
        setTableData((prevTableData) => [...prevTableData, customRow]);
    };

    const handleRemoveField = (index) => {
        const updatedFields = inputFields.filter((_, i) => i !== index);
        setInputFields(updatedFields);
    };



    const handleDeleteRow = async (index) => {
        try {
            const taskNumber = tableData[index].task_number;
            console.log('Task number for deletion:', taskNumber);

            if (!taskNumber) {
                console.error("Task number is missing for the task to be deleted.");
                return;
            }

            const newTableData = tableData.filter((_, i) => i !== index);
            setTableData(newTableData);

            localStorage.setItem('dynamicTableData', JSON.stringify(newTableData));

            const accessToken = localStorage.getItem('access_token');
            await axios.delete(`${apiUrl}/api/delete-task/${estimateId}/${taskNumber}/`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                data: { task_number: taskNumber }
            });

            console.log('Task deleted successfully');
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };




    const handleEditClick = (index) => {
        setEditIndex(index);
        const { job, laborCost, materialCost } = splitTaskIntoColumns(tableData[index]);
        setEditValues({
            job,
            laborCost: laborCost.replace('$', ''),
            materialCost: materialCost.replace('$', ''),
        });
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditValues({ ...editValues, [name]: value });
    };

    const handleUpdateClick = async (index) => {
        const { job, laborCost, materialCost } = splitTaskIntoColumns(tableData[index]);

        const updatedJob = editValues.job || job;
        const updatedLaborCost = editValues.laborCost !== '' ? parseFloat(editValues.laborCost).toFixed(2) : laborCost.replace('$', '');
        const updatedMaterialCost = editValues.materialCost !== '' ? parseFloat(editValues.materialCost).toFixed(2) : materialCost.replace('$', '');

        const updatedTaskDescription = `${updatedJob} Labor Cost: $${updatedLaborCost} Material Cost: $${updatedMaterialCost}`;

        const newTableData = tableData.map((item, i) => (i === index ? {
            ...item,
            task_description: updatedTaskDescription
        } : item));

        setTableData(newTableData);

        localStorage.setItem('dynamicTableData', JSON.stringify(newTableData));

        setEditIndex(null);

        const taskNumber = tableData[index].task_number;

        try {
            const accessToken = localStorage.getItem('access_token');
            await axios.patch(`${apiUrl}/api/update-task/${estimateId}/${taskNumber}/`, {
                task_description: updatedTaskDescription
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Task updated successfully in the database.');
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };


    const handleSalesTaxChange = (event) => setSalesTaxPercent(parseFloat(event.target.value) || 0);
    const handleDiscountChange = (event) => setDiscountPercent(parseFloat(event.target.value) || 0);

    const toggleDiscount = () => setApplyDiscount(!applyDiscount);
    const toggleMargin = () => setApplyMargin(!applyMargin);

    const handleLogoUpload = (event) => {
        const file = event.target.files[0];
        resizeImage(file, 50, 50, (resizedImage) => setLogo(resizedImage));
    };

    const splitTaskIntoColumns = (task) => {
        const taskDescription = typeof task === 'string' ? task : task.task_description;

        // console.log("Task received:", taskDescription);

        const laborCostIndex = taskDescription.indexOf('Labor Cost:');
        const materialCostIndex = taskDescription.indexOf('Material Cost:');

        const job = taskDescription.substring(0, Math.min(
            laborCostIndex !== -1 ? laborCostIndex : taskDescription.length,
            materialCostIndex !== -1 ? materialCostIndex : taskDescription.length
        )).trim();

        let laborCost = '';
        if (laborCostIndex !== -1) {
            const laborCostMatch = taskDescription.substring(laborCostIndex).match(/Labor Cost: \$([\d.]+)/);
            if (laborCostMatch) {
                laborCost = parseFloat(laborCostMatch[1]).toFixed(2);
            }
        }

        let materialCost = '';
        if (materialCostIndex !== -1) {
            const materialCostMatch = taskDescription.substring(materialCostIndex).match(/Material Cost: \$([\d.]+)/);
            if (materialCostMatch) {
                materialCost = parseFloat(materialCostMatch[1]).toFixed(2);
            }
        }

        return {
            job,
            laborCost: laborCost || '0.00',
            materialCost: materialCost || '0.00',
        };
    };


    const applyMarginToLaborCost = (laborCost) => {
        const cost = parseFloat(laborCost.replace('$', '')) || 0;
        const marginAmount = cost * (marginPercent / 100);
        return (cost + marginAmount).toFixed(2);
    };

    const handleMarginChange = (event) => {
        const value = event.target.value;
        setMarginPercent(value ? parseFloat(value) : 0);
    };

    const calculateTotals = () => {
        if (!tableData || tableData.length === 0) {
            return {
                totalLaborCost: '0.00',
                totalMaterialCost: '0.00',
                combinedTotal: '0.00',
                totalDiscount: '0.00',
                totalSalesTax: '0.00',
                grandTotal: '0.00',
            };
        }

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
            estimateId,
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
            applyDiscount,
        });
    };

    const { totalLaborCost, totalMaterialCost, combinedTotal, totalDiscount, totalSalesTax, grandTotal } = calculateTotals();

    return {
        handleDiscountChange,
        handleSalesTaxChange,
        totalLaborCost,
        totalMaterialCost,
        combinedTotal,
        totalDiscount,
        totalSalesTax,
        grandTotal,
        tableData,
        clientName,
        clientAddress,
        clientPhone,
        clientEmail,
        projectName,
        projectLocation,
        startDate,
        endDate,
        saveEstimateData,
        exportTablePDF,
        tableData,
        inputFields,
        editIndex,
        editValues,
        salesTaxPercent,
        discountPercent,
        applyDiscount,
        applyMargin,
        marginPercent,
        companyName,
        address,
        phone,
        setClientName,
        setClientAddress,
        setClientPhone,
        setClientEmail,
        setProjectName,
        setProjectLocation,
        setStartDate,
        setEndDate,
        setCompanyName,
        setAddress,
        setPhone,
        handleAddAllRows,
        handleAddCustomRow,
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
        setTableData,
        tableRef,
        isEditing,
        toggleEdit,
        setInputFields,

    };
};

export default useDynamicTable;
