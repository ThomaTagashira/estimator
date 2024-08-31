function getTodayDate() {
    const today = new Date();
    const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  }
  
  function generateHTMLContent({
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
    totalLaborCost,
    totalMaterialCost,
    combinedTotal,
    discountPercent,
    totalDiscount,
    salesTaxPercent,
    totalSalesTax,
    grandTotal,
    tableData,
    applyDiscount // New parameter to determine if the discount row should be included
  }) {
    const todayDate = getTodayDate();
  
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page {
            margin: 0;
            size: letter;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 1000px;
            margin: auto;
            box-sizing: border-box;
          }
          .header {
            background-color: #1d2a5d;
            color: white;
            padding: 10px;
            margin-bottom: 20px;
            text-align: center;
            position: relative;
            box-sizing: border-box;
          }
          .header img {
            position: absolute;
            top: 20px;
            left: 20px;
            width: 80px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 0;
            font-size: 12px;
          }
          .sub-container {
            width: 90%;
            max-width: 800px;
            margin: auto;
            box-sizing: border-box;
          }
          .info-container {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
          }
          .info-section {
            width: 45%;
          }
          .info-section h3 {
            margin-bottom: 5px;
            font-size: 14px;
          }
          .info-section p {
            margin: 5px 0;
            font-size: 12px;
          }
          .information p {
            margin-left: 5%;
            line-height: 1;
            font-size: 10px;
          }
          .estimate-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100%;
            border: 2px solid #5e5e5e;
            padding: 10px;
            font-size: 14px;
            text-align: center;
            font-weight: bold;
            margin-top: 0;
            box-sizing: border-box;
          }
          .estimate-info p {
            margin: 5px 0;
            font-size: 12px;
          }
          .scope-of-work {
            background-color: #1d2a5d;
            color: white;
            padding: 10px;
            margin-top: 20px;
            text-align: center;
            box-sizing: border-box;
          }
          .scope-of-work p {
            margin: 0;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 40px;
            box-sizing: border-box;
          }
          table, th, td {
            border: 1px solid black;
          }
          th, td {
            padding: 10px;
            text-align: left;
            font-size: 12px;
          }
          .no-border {
            border: none;
            width: 95%;
            max-width: 800px;
            margin: auto;
          }
          .no-border td {
            border: none;
            text-align: right;
            padding: 10px;
            padding-left: 5px;
            padding-top: 1px;
            padding-bottom: 1px;
          }
          .align-right {
            text-align: right;
          }
          .align-left {
            text-align: left;
          }
          .align-center {
            text-align: center;
          }
          .total-row td {
            padding-top: 10px;
          }
          .export-btn {
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #1d2a5d;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 16px;
          }
        </style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js"></script>
        <script>
          function exportToPDF() {
            const element = document.getElementById('content');
            const button = document.querySelector('.export-btn');
            button.style.display = 'none';
            html2pdf().from(element).set({
              margin: 0,
              filename: 'estimate.pdf',
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            }).save().then(() => {
              button.style.display = 'block';
            });
          }
        </script>
      </head>
      <body>
        <div id="content" class="container">
          <div class="header">
            <img src="${logo}" alt="Company Logo" width="80">
            <h1>Remodel Estimate</h1>
            <p>${companyName} | ${address} | ${phone}</p>
          </div>
          <div class="sub-container">
            <div class="info-container">
              <div class="info-section">
                <h3>Project Information</h3>
                <div class="information">
                  <p>Project Name: ${projectName}</p>
                  <p>Project Location: ${projectLocation}</p>
                  <p>Start Date: ${startDate}</p>
                  <p>End Date: ${endDate}</p>
                </div>
              </div>
              <div class="estimate-info">
                <p>Estimate Number: ${estimateNumber}</p>
                <p>Date: ${todayDate}</p>
              </div>
            </div>
            <div class="info-container">
              <div class="info-section">
                <h3>Client Information</h3>
                <div class="information">
                  <p>Full Name: ${clientName}</p>
                  <p>Address: ${clientAddress}</p>
                  <p>Phone: ${clientPhone}</p>
                  <p>Email: ${clientEmail}</p>
                </div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Job</th>
                  <th>Labor</th>
                  <th>Material</th>
                </tr>
              </thead>
              <tbody>
                ${tableData.map((row, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${row.job || ''}</td>
                    <td>${row.laborCost ? `${row.laborCost}` : ''}</td>
                    <td>${row.materialCost ? `${row.materialCost}` : ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <table class="no-border">
              <tbody>
                <tr class="no-border total-row">
                  <td class="no-border align-left"><strong>Subtotal</strong></td>
                  <td class="no-border" colspan="2" class="align-right"><strong>$${combinedTotal}</strong></td>
                </tr>
                ${applyDiscount ? `
                <tr class="no-border total-row">
                  <td class="no-border align-left"><strong>Discount</strong></td>
                  <td class="no-border align-center"><span>${discountPercent}%</span></td>
                  <td class="no-border align-right"><strong>$${totalDiscount}</strong></td>
                </tr>
                ` : ''}
                <tr class="no-border total-row">
                  <td class="no-border align-left"><strong>Tax</strong></td>
                  <td class="no-border align-center"><span>${salesTaxPercent}%</span></td>
                  <td class="no-border align-right"><strong>$${totalSalesTax}</strong></td>
                </tr>
                <tr class="no-border total-row">
                  <td class="no-border align-left"><strong>Total</strong></td>
                  <td class="no-border" colspan="2" class="align-right"><strong>$${grandTotal}</strong></td>
                </tr>
              </tbody>
            </table>
            <button class="export-btn" onclick="exportToPDF()">Export to PDF</button>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  export const exportPDF = (
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
    totalLaborCost,
    totalMaterialCost,
    combinedTotal,
    discountPercent,
    totalDiscount,
    salesTaxPercent,
    totalSalesTax,
    grandTotal,
    tableData,
    applyDiscount // New parameter to determine if the discount row should be included
  ) => {
    const htmlContent = generateHTMLContent({
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
      totalLaborCost,
      totalMaterialCost,
      combinedTotal,
      discountPercent,
      totalDiscount,
      salesTaxPercent,
      totalSalesTax,
      grandTotal,
      tableData,
      applyDiscount // Pass the parameter down to generateHTMLContent
    });
  
    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  };
