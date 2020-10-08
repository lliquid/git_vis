**Statistics**
----
Statistics return summary statistics information regarding the commit history.

* **URL**

  `/stats`

* **Method:**
  
  `GET`
  
*  **URL Params**

   **Required:**
 
   `repository=[string]`
   
   `metric=[string]` possible values `added_lines`, `deleted_lines`, `total_changed_lines`, `changed_files`, `added_files`, `deleted_files` , `commits`, `number_of_unique_developers`
   
   `dimension=[string]`, possible values `date`, `directory`, `developer`

   **Optional:**
 
   `branch=[string]` default `branch=master`
   
   `start_date=[date]` default `undefined` will automatically use the date of the first commit
   
   `end_date=[date]` default `undefined` will automatically use the date of the last commit
   
   `developers=[array]` default `[]` empty array will automatically include all developers
   
   `file_types=[array]` default `[]` empty array will automatically include all file types
   
   `folders=[array]` default `[]` empty array will automatically include all folders


* **Success Response:**
  
  * **Code:** 200 <br />
    **Content:** json format of results, if selected dimension is `directory`, will return a tree structured json object
 

* **Error Response:**

  * **Code:** 404 <br />
    **Content:** `{ error : "" }`


* **Sample Call:**

    `$ curl "http://localhost:5000/stats?repository=../data/redux&metric=total_changed_lines&dimension=directory&branch=master&file_types=js,md,html,py"`
    
    return
    
    ``
    
    http://localhost:5000/stats?repository=../data/redux&metric=commits&dimension=developer&branch=master&file_types=js,md,html,py
    

    http://localhost:5000/stats?repository=../data/redux&metric=lines_added&dimension=directory&branch=master&start_date=2019-07-01&end_date=2019-12-31
    
