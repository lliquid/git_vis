from pydriller import RepositoryMining
from pydriller.domain.commit import ModificationType

def collect_commits(repo_url):

    commit_info_all = []
    # iterate through all the commits and store in mongo
    for commit in RepositoryMining(path_to_repo=repo_url).traverse_commits():
        # store commit info
        commit_info = {
            "commit_hash": commit.hash,
            "author_name": commit.author.name,
            "author_email": commit.author.email,
            "author_date": commit.author_date,
            "commit_msg": commit.msg,
            "modifications": []
        }
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
        commit_info_all.append(commit_info)

    return commit_info_all

