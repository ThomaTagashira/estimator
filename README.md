# Construction Estimator

## System Design Diagram
![System Design Diagram](SystemDesign.jpg)

## User Workflow Diagram
![User Workflow Diagram 2](User%20workflow%20diagram.jpg)

### Endpoint APIs  
  
#### POST requests:  
##### 1. Enter Business Info:  
###### &emsp;Input: business_name, business_address, business_phone
###### &emsp;Response: input data saved to BusinessInfo 

##### 2. Create new estimate:  
###### &emsp;Input: user, estimate_id, date_created, last_modified, project_name  
###### &emsp;Response: input data saved to UserEstimates  
  
##### 3. Enter Project and Client info:  
###### &emsp;Input: client_name, client_address, client_email, project_name, project_location, start_date, end_date  
###### &emsp;Response: input data saved to ClientData and ProjectData  
  
##### 4. Upload file to extract and generate search queries:
###### &emsp;Input: JPG file  
###### &emsp;Response: Dictionary list of hand written notes  
  
##### 5. Edit and/or execute search queries:  
###### &emsp;Input: Dictionary list returned from API response from #3  
###### &emsp;Response: String of most closely related datapoint saved in vector database based on similarity-distance (task_description, labor_cost, and material_cost)  
  
##### 6. Manually enter search query:  
###### &emsp;Input: User provided search query string  
###### &emsp;Response: String of most closely related datapoint saved in vector database based on similarity-distance (task_description, labor_cost, and material_cost)
  
##### 7. Edit Business, Project, and/or Client info:  
###### &emsp;Input: business_name, business_address, business_phone, client_name, client_address, client_phone, client_email, project_name, project_location, start_date, end_date  
###### &emsp;Response: input/update data saved to BusinessData, ClientData, and/or ProjectData
  
##### 8. Enter margin/discount to apply to estimate (Manual command: Click save):  
###### &emsp;Input: task_description, labor_cost, material_cost, estimate_margin, estimate_discount  
###### &emsp;Response: input/update data saved to EstimateItems and/or MarginValues  

##### 9. Enter margin/discount to apply to estimate (Manual command: Click save):
###### &emsp;Input: estimate_margin, estimate_discount
###### &emsp;Response: update data saved to MarginValues

##### 10. Export estimate to HTML auto-save estimate:  
###### &emsp;Input: business_name, business_address, business_phone, project_name, project_location, start_data, end_date, client_name, client_address, client_phone, client_email, task_description, labor_cost, material_cost, estimate_margin, estimate_discount  
###### &emsp;Response: input/update data saved to BusinessInfo, ProjectData, ClientData, EstimateItems, and MarginValues  

#### GET requests:
##### 1: Get list of all saved user estimates:
###### &emsp;Input: user
###### &emsp;Response: estimate_id, date_created, last_modified, project_name

#### 2. Get saved data for selected estimate:
###### &emsp;Input: user, estimate_id
###### &emsp;Response: estimate_id, task_description, labor_cost, material_cost, business_name, business_address, business_phone, project_name, project_location, start_date, end_date, client_name, client_address, client_phone, client_email, estimate_margin, estimate_discount

#### 3. Generate Estimate:
###### &emsp;Input: user, estimate_id
###### &emsp;Response: client_name, client_address, client_phone, client_email, project_name, project_location, start_date, end_date, business_name, business_address, business_phone
          
    
