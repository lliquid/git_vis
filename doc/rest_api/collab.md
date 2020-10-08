**Collaboration Graph**
----
Return collaboration information based on specified repository, branch, data filters. Collaboration information can be returned in two different forms, aka. developer collaboration frequency graph and develop - file editing bipartite graph.

* **URL**

  `/collab`

* **Method:**
  
  `GET`
  
*  **URL Params**

   **Required:**
 
   `repository=[string]`
   
   `requestedGraph=[string]` possible values `collab` and `coedit`
   
   **Optional:**
 
   `branch=[string]` default `branch=master`
   
   `start_date=[date]` default `undefined` will automatically use the date of the first commit
   
   `end_date=[date]` default `undefined` will automatically use the date of the last commit
   
   `developers=[array]` default `[]` empty array will automatically include all developers
   
   `file_types=[array]` default `[]` empty array will automatically include all file types
   
   `folders=[array]` default `[]` empty array will automatically include all folders


* **Success Response:**
  
  * **Code:** 200 <br />
    **Content:** json graph in networkx json format
 

* **Error Response:**

  * **Code:** 404  <br />
    **Content:** `{ error : "404" }`


* **Sample Call:**

    Request a collaboration graph for a given repository and files with corresponding extensions:

    `$ curl "http://localhost:5000/collab?repository=../data/redux&requested_graph=collab&branch=master&file_types=.js,.md,.html,.py"`
    
    
    return
        
    
    Request a co-edit graph for a given repository and a list of developers
    
    `$ curl "http://localhost:5000/collab?repository=../data/redux&requested_graph=coedit&branch=master&file_types=.js,.md,.html,.py"`
    
    
