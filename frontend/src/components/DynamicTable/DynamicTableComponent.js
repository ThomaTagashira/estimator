// import React from 'react';

// const DynamicTableComponent = ({
//     inputFields,
//     handleInputChange,
//     handleRemoveField,
//     tableData,
//     handleEditClick,
//     handleDeleteRow,
//     splitTaskIntoColumns,
//     applyMarginToLaborCost,
//     editIndex,
//     editValues,
//     handleEditChange,
//     handleUpdateClick,
//     applyMargin,
//     saveEstimateData, // New: Passed down to save data when editing is done
// }) => {
//     return (
//         <div>
//             {/* Dynamic Input Fields */}
//             {((value, index) => (
//                 <div key={index}>
//                     <input
//                         type="text"
//                         value={value}
//                         onChange={(e) => handleInputChange(index, e.target.value)}
//                         placeholder="Enter a task"
//                     />
//                     <button onClick={() => handleRemoveField(index)}>Remove Line</button>
//                 </div>
//             ))}
//             <br />

//             {/* Dynamic Table */}
//             <table>
//                 <thead>
//                     <tr>
//                         <th></th>
//                         <th>Job</th>
//                         <th>Labor Cost</th>
//                         <th>Material Cost</th>
//                         <th></th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {tableData.map((item, index) => {
//                         const { job, laborCost, materialCost } = splitTaskIntoColumns(item);
//                         const adjustedLaborCost = applyMargin ? applyMarginToLaborCost(laborCost) : laborCost;

//                         return (
//                             <tr key={index}>
//                                 <td>{index + 1}</td>
//                                 <td>
//                                     {editIndex === index ? (
//                                         <textarea
//                                             name="job"
//                                             value={editValues.job}
//                                             onChange={handleEditChange}
//                                             rows="3"
//                                             style={{ width: '100%' }}
//                                         />
//                                     ) : (
//                                         job
//                                     )}
//                                 </td>
//                                 <td>
//                                     {editIndex === index ? (
//                                         <input
//                                             type="text"
//                                             name="laborCost"
//                                             value={editValues.laborCost}
//                                             onChange={handleEditChange}
//                                             placeholder="0.00"
//                                         />
//                                     ) : (
//                                         `$${adjustedLaborCost}` // Add $ sign here for display
//                                     )}
//                                 </td>
//                                 <td>
//                                     {editIndex === index ? (
//                                         <input
//                                             type="text"
//                                             name="materialCost"
//                                             value={editValues.materialCost}
//                                             onChange={handleEditChange}
//                                             placeholder="0.00"
//                                         />
//                                     ) : (
//                                         `$${materialCost}` // Add $ sign here for display
//                                     )}
//                                 </td>
//                                 <td>
//                                     {editIndex === index ? (
//                                         <button onClick={() => handleUpdateClick(index)}>Update</button>
//                                     ) : (
//                                         <>
//                                             <button onClick={() => handleEditClick(index)}>Edit</button>
//                                             <button onClick={() => handleDeleteRow(index)}>Delete</button>
//                                         </>
//                                     )}
//                                 </td>
//                             </tr>
//                         );
//                     })}
//                 </tbody>
//             </table>

//             {/* Save button to save changes to backend */}
//             <button onClick={saveEstimateData}>Save Changes</button>
//         </div>
//     );
// };

// export default DynamicTableComponent;
