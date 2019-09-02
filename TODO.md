### Todo List

- [Done] extract document tree at specified timestamp / commit
- [Done] obtain a flattened document list from the tree structure
- [Done] obtain a File data structure that records the lines contributed by each author
- collect code contribution into a data table with the following schema
    committer | commit_type | file_path | timestamp | lines_added | lines_removed
- obtain a quick summary of the code contribution along different dimensions or along different combinations of dimensions
    filters: committer | commit_type | directory | file_type | start_time - end_time
    dimensions: time * committer * directory
- deep dive: 
    - code lineage analysis 
    - code dependency analysis

