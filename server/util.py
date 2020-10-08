# from datetime import time
from pydriller import RepositoryMining
from datetime import datetime
from directory import Directory

global cache

cache = {}

def timeit(method):
    def timed(*args, **kw):
        ts = datetime.now()
        result = method(*args, **kw)
        te = datetime.now()
        if 'log_time' in kw:
            name = kw.get('log_name', method.__name__.upper())
            kw['log_time'][name] = int((te - ts).seconds)
        else:
            print('%r  %2.2f s' %\
                  (method.__name__, (te - ts).seconds))
        return result
    return timed


@timeit
def get_commits(repo_url, branch='master'):

    if repo_url in cache:
        if branch in cache[repo_url]:
            return cache[repo_url][branch]['commits']

    commits = []
    cache[repo_url] = {branch: {'commits': commits}}

    root = Directory()

    # iterate through all the commits and store in mongo
    for commit in RepositoryMining(
            path_to_repo=repo_url,
            only_in_branch=branch,
    ).traverse_commits():

        root.update_with_commits([commit])
        root.clean_empty_folder()
        commit_info = {
            "commit_hash": commit.hash,
            "author_name": commit.author.name,
            "author_email": commit.author.email,
            "commit_date": commit.committer_date,
            "commit_msg": commit.msg,
            "modifications": [],
            'directory': root

        }
        root = root.copy()

        # store modification on each file
        for modification in commit.modifications:

            commit_info["modifications"].append({
                "old_path": modification.old_path,
                "new_path": modification.new_path,
                "change_type": str(modification.change_type),
                "diff": modification.diff,
                "lines_added": modification.added,
                "lines_removed": modification.removed
            })
        commits.append(commit_info)

    root.clean_print()

    return commits

# get a data table from the commit info to support stats computation
# def get_table(commits, ):


# get snapshot of directory structure at a specified date
def get_snapshot(date, repo_url, branch='master'):



    return None

