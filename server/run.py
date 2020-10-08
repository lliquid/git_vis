from flask import Flask
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
import networkx as nx
import dateutil.parser as date_parser
from networkx.readwrite import json_graph
import pandas as pd
from pandasql import sqldf
from util import timeit, get_commits
from collections import Counter
import math



pysqldf = lambda q: sqldf(q, globals())

app = Flask(__name__)
api = Api(app)
CORS(app)

base_parser = reqparse.RequestParser()
base_parser.add_argument('repository', type=str, required=True, help='', location='args', default='')
base_parser.add_argument('branch', type=str, required=False, help='', location='args', default='master')
base_parser.add_argument('start_date', type=str, required=False, help='', location='args', default=None)
base_parser.add_argument('end_date', type=str, required=False, help='', location='args', default=None)
base_parser.add_argument('developers', type=str, required=False, help='', location='args', default=None)
base_parser.add_argument('file_types', type=str, required=False, help='', location='args', default='')
base_parser.add_argument('folders', type=str, required=False, help='', location='args', default='')


def _parse_args(args):
    # if args.start_date is not None:
    #     args.start_date = date_parser.parse(args.start_date).replace(tzinfo=None)
    # if args.end_date is not None:
    #     args.end_date = date_parser.parse(args.end_date).replace(tzinfo=None)
    if args.file_types is not None:
        if args.file_types != '':
            args.file_types = args.file_types.split(',')
        else:
            args.file_types = None
    if args.folders is not None:
        if args.folders != '':
            args.folders = args.folders.split(',')
        else:
            args.folders = None
    if args.developers is not None:
        if args.developers != '':
            args.developers = args.developers.split(',')
        else:
            args.developers = None


class Collab(Resource):

    parser = base_parser.copy()
    parser.add_argument('requested_graph', type=str, required=True, help='', location='args', default='collab')

    @timeit
    def get(self):
        args = self.parser.parse_args()
        _parse_args(args)
        commits = get_commits(args.repository,
                              branch=args.branch)

        bg = nx.Graph()

        for c in commits:

            developer = c['author_name']
            date = c['commit_date'].strftime("%Y-%m-%d")

            if args.developers is not None and developer not in args.developers:
                continue
            if args.start_date is not None and args.end_date is not None \
                    and (date < args.start_date or date > args.end_date):
                continue

            for m in c['modifications']:
                file_path = m['new_path'] or m['old_path']

                # filter selected file types
                if args.file_types is not None:
                    not_match_any_file_type = True
                    for file_type in args.file_types:
                        if file_path.endswith(file_type):
                            not_match_any_file_type = False
                    if not_match_any_file_type:
                        continue

                # filter selected folders
                if args.folders is not None:
                    not_match_any_folder = True
                    for folder in args.folders:
                        if file_path.startswith(folder):
                            not_match_any_folder = False
                    if not_match_any_folder:
                        continue

                # add node and authorship edge to the bipartite graph
                if not bg.has_node(developer):
                    bg.add_node(developer, type='author_name')
                if not bg.has_node(file_path):
                    bg.add_node(file_path, type='file_path')
                bg.add_edge(developer, file_path)

        if args.requested_graph == 'coedit':
            if len(bg) != 0:
                # fix random seed
                import random
                random.seed(42)
                import numpy
                numpy.random.seed(42)

                pos = nx.spring_layout(bg, k=2.0 / math.sqrt(len(bg)))
                for k, v in pos.items():
                    bg.nodes[k]['precomputed_layout'] = {
                        'x': float(v[0]),
                        'y': float(v[1])
                    }
            return {'graph_data': json_graph.node_link_data(bg)}, 200

        if args.requested_graph == 'collab':

            developers = [n for n in bg.nodes if bg.nodes[n]['type'] == "author_name"]

            for dev in developers:
                bg.nodes[dev]['weight'] = bg.degree[dev]
            developers = list(filter(lambda n: bg.degree(n) > 1, developers))

            g = nx.Graph()
            for n in developers:
                g.add_node(n, weight=bg.degree(n))
            for n0 in developers:
                for n1 in developers:
                    w = len(set(bg.neighbors(n0)).intersection(set(bg.neighbors(n1))))
                    if w > 0:
                        g.add_edge(n0, n1, weight=w)
                        g.add_edge(n1, n0, weight=w)

            return {'graph_data': json_graph.node_link_data(g)}, 200

        return {'unknown request'}, 404
    

class Stats(Resource):

    parser = base_parser.copy()

    ### possible values for dimension
    # `date`, `directory`, `developer`, 'none'
    parser.add_argument('dimension', type=str, required=True, help='', location='args', default='date')

    ### possible values for metric:
    # `added_lines`, `deleted_lines`, `total_changed_lines`, `changed_files`,
    # `added_files`, `deleted_files`, `commits`, `number_of_unique_developers`
    parser.add_argument('metric', type=str, required=False, help='', location='args', default='total_changed_lines')

    @timeit
    def get(self):
        args = self.parser.parse_args()
        _parse_args(args)
        commits = get_commits(args.repository,
                              branch=args.branch)

        data = {
            "date": [], "file_path": [], "developer": [],
            "added_lines": [], "deleted_lines": [], "added_file": [], "deleted_file": [],
            "commit_hash": []
        }

        for c in commits:

            developer = c['author_name']
            date = c['commit_date'].strftime("%Y-%m-%d")

            if args.developers is not None and len(args.developers) > 0 and developer not in args.developers:
                continue
            if args.start_date is not None and args.end_date is not None \
                    and (date < args.start_date or date > args.end_date):
                continue

            for m in c['modifications']:
                file_path = m['new_path'] or m['old_path']

                # filter selected file types
                if args.file_types is not None and len(args.file_types) > 0:
                    not_match_any_file_type = True
                    for file_type in args.file_types:
                        if file_path.endswith(file_type):
                            not_match_any_file_type = False
                    if not_match_any_file_type:
                        continue

                # filter selected folders
                if args.folders is not None and len(args.folders) > 0:
                    not_match_any_folder = True
                    for folder in args.folders:
                        if file_path.startswith(folder):
                            not_match_any_folder = False
                    if not_match_any_folder:
                        continue

                # add information to the pandas table
                data['date'].append(date)
                data["file_path"].append(file_path)
                data['developer'].append(developer)
                data['added_lines'].append(m['lines_added'])
                data['deleted_lines'].append(m['lines_removed'])
                data['added_file'].append(None if m["change_type"] != 'ADD' else m["new_path"])
                data['deleted_file'].append(None if m["change_type"] != 'DELETE' else m["old_path"])
                data['commit_hash'].append(c['commit_hash'])

        df = pd.DataFrame(data)
        data = []
        if args.dimension == "developer" and args.metric == "commits":
            query_results = sqldf("select developer, count(DISTINCT commit_hash) as commits from df group by developer")
            for index, row in query_results.iterrows():
                data.append({
                    "name": row["developer"],
                    "value": row["commits"]
                })
        if args.dimension == "developer" and args.metric == "lines_added":
            query_results = sqldf("select developer, sum(added_lines) as lines_added from df group by developer")
            for index, row in query_results.iterrows():
                data.append({
                    "name": row["developer"],
                    "value": row["lines_added"]
                })

        if args.dimension == "date" and args.metric == "lines_added":
            query_results = sqldf("select date, sum(added_lines) as lines_added from df group by date order by date")
            for index, row in query_results.iterrows():
                data.append({
                    "date": row["date"],
                    "value": row["lines_added"]
                })

        if args.dimension == "date" and args.metric == "commits":
            query_results = sqldf("select date, count(DISTINCT commit_hash) as commits from df group by date order by date")
            for index, row in query_results.iterrows():
                data.append({
                    "date": row["date"],
                    "commits": row["commits"]
                })


        if args.dimension == 'none':
            data = {}
            query_results = sqldf("select sum(added_lines) as lines_added, sum(deleted_lines) as lines_deleted from df")
            for index, row in query_results.iterrows():
                data['lines_added'] = int(row["lines_added"] or 0)
                data['lines_deleted'] = int(row['lines_deleted'] or 0)
                break

            query_results = sqldf("select count(DISTINCT added_file) as added_files from df")
            for index, row in query_results.iterrows():
                data['added_files'] = int(row['added_files'] or 0)
                break

            query_results = sqldf("select count(DISTINCT file_path) as changed_files from df")
            for index, row in query_results.iterrows():
                data['changed_files'] = int(row['changed_files'] or 0)
                break

            query_results = sqldf("select count(DISTINCT developer) as developers from df")
            for index, row in query_results.iterrows():
                data['developers'] = int(row['developers'] or 0)
                break

            query_results = sqldf("select count(DISTINCT commit_hash) as commits from df")
            for index, row in query_results.iterrows():
                data['commits'] = int(row['commits'] or 0)
                break


        if args.dimension == "directory":
            # cover all the metrics
            # number of developers, number of commits, number of deleted lines
            # obtain directory structure
            directory = commits[-1]['directory'].copy()
            query_results = sqldf("select file_path, sum(added_lines) as lines_added, sum(deleted_lines) as lines_deleted from df group by file_path")
            for index, row in query_results.iterrows():
                path, val0, val1 = row["file_path"], row["lines_added"], row["lines_deleted"]
                old_val0 = directory.get_value(path, 'lines_added')
                if old_val0 is not None:
                    val0 += old_val0
                directory.update_value(path, "lines_added", val0)
                old_val1 = directory.get_value(path, 'lines_deleted')
                if old_val1 is not None:
                    val1 += old_val1
                directory.update_value(path, "lines_deleted", val1)

            query_results = sqldf("select added_file from df where added_file is not NULL")
            for index, row in query_results.iterrows():
                path = row["file_path"]
                directory.update_value(path, "is_new", True)

            # collect the commit hashes and developers for each file
            query_results = sqldf("select file_path, commit_hash, developer from df")
            for index, row in query_results.iterrows():
                path, commit_hash, developer = \
                    row["file_path"], row["commit_hash"], row["developer"]
                commits = directory.get_value(path, 'commits_list')
                developers = directory.get_value(path, 'developers_list')
                if commits is not None:
                    if commit_hash not in commits:
                        commits.append(commit_hash)
                else:
                    directory.update_value(path, 'commits_list', [commit_hash])
                if developers is not None:
                    if developer not in developers:
                        developers.append(developer)
                else:
                    directory.update_value(path, 'developers_list', [developer])

            query_results = sqldf("select file_path, count(DISTINCT commit_hash) as commits, count(DISTINCT developer) as developers from df group by file_path")
            for index, row in query_results.iterrows():
                path = row["file_path"]
                directory.update_value(path, "commits", row["commits"])
                directory.update_value(path, "developers", row["developers"])

            data = directory.to_json_tree()

        return {"json": data}


class Info(Resource):

    parser = reqparse.RequestParser()
    parser.add_argument('repository', type=str, required=True, help='', location='args', default='')
    parser.add_argument('branch', type=str, required=False, help='', location='args', default='master')
    parser.add_argument('type', type=str, required=True, help='', location='args', default='date_range')
    parser.add_argument('start_date', type=str, required=False, help='', location='args', default=None)
    parser.add_argument('end_date', type=str, required=False, help='', location='args', default=None)

    @timeit
    def get(self):
        args = self.parser.parse_args()
        commits = get_commits(args.repository,
                              branch=args.branch)

        data = None
        if args.type == 'date_range':
            data = [commits[0]['commit_date'].strftime("%Y-%m-%d"), commits[-1]['commit_date'].strftime("%Y-%m-%d")]
        if args.type == 'developers':
            data = list(set(list(map(lambda c:c['author_name'], commits))))
        if args.type == 'file_types':
            data = []
            for c in commits:
                for m in c['modifications']:
                    path = m['new_path'] or m['old_path']
                    if '.' in path:
                        data.append(path.split('.')[-1])
            data = [{'name': k, 'value': v} for k, v in dict(Counter(data)).items()]
        if args.type == 'directory':
            data = commits[-1]['directory'].to_json_tree()

        return {'json': data}


class Meta(Resource):

    @timeit
    def get(self):
        return {
            'repositories': ['redux'],
            'branches': {
                'redux': ['master']
            }}


api.add_resource(Collab, '/collab')
api.add_resource(Stats, '/stats')
api.add_resource(Info, '/info')
api.add_resource(Meta, '/meta')


if __name__ == '__main__':
    app.run(debug=True)
