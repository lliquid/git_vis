import networkx as nx
from networkx.algorithms import bipartite

def coedit(commits, args):

    # extract a bipartite graph containing author emails and edited files
    bg = nx.Graph()
    
    for c in commits:
        
        author_email = c['author_name']
                
        for m in c['modifications']:

            file_path = m['new_path'] or m['old_path']

            if not bg.has_node(author_email):
                bg.add_node(author_email, type='author_name')            
            if not bg.has_node(file_path):
                bg.add_node(file_path, type='file_path')
            
            bg.add_edge(author_email, file_path)
            
    authors = [n for n in bg.nodes if bg.nodes[n]['type'] == "author_name"]
    file_paths = [n for n in bg.nodes if bg.nodes[n]['type'] == "file_path"]         

    return bg


# def collab(args):



