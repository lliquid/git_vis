**Info**
----
Info return information regarding the repo.

* **URL**

  `/info`

* **Method:**
  
  `GET`
  
*  **URL Params**

   **Required:**
 
   `repository=[string]`
      
   `type=[string]`, possible values `date_range`, `directory`, `developers`, `file_types`

   **Optional:**
 
   `branch=[string]` default `branch=master`
   
   `end_date=[string]`  return directory structure, developers at selected snapshot

    `start_date=[string]`  return developers at selected snapshot   
   

* **Success Response:**
  
  * **Code:** 200 <br />
    **Content:** json format of results, if selected dimension is `directory`, will return a tree structured json object
 

* **Error Response:**

  * **Code:** 404 <br />
    **Content:** `{ error : "" }`


* **Sample Call:**

    `$ curl "http://localhost:5000/info?repository=../data/redux&type=developers"`
        
    `$ curl "http://localhost:5000/info?repository=../data/redux&type=date_range"`
    
    `$ curl "http://localhost:5000/info?repository=../data/redux&type=directory"`

    `$ curl "http://localhost:5000/info?repository=../data/redux&type=file_types"`