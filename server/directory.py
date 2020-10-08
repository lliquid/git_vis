import os.path


class Directory:

    ## class Directory maintains a static snapshot of a directory structure
    ## class Directory maintains a static snapshot of a directory structure
    def __init__(self, name=''):
        self.sub_directories = {}
        self.files = {}
        self.nfiles = 0
        self.name = name

    def add_file(self, path, file, lines=None):

        dirname = os.path.dirname(path)

        if dirname == '':
            self.files[path] = {
                "file": file,
                "lines": lines
            }
        else:
            sub_directory = path.split('/')[0]
            if sub_directory not in self.sub_directories:  # create new directory
                self.sub_directories[sub_directory] = Directory(name=sub_directory)
            self.sub_directories[sub_directory].add_file('/'.join(path.split('/')[1:]), file, lines=lines)

        self.nfiles += 1

    def remove_file(self, path):

        dirname = os.path.dirname(path)

        if dirname == '':
            if path in self.files:
                self.nfiles -= 1
                file_data = self.files[path]
                del self.files[path]
                return file_data
            else:
                return None
        else:
            sub_directory = path.split('/')[0]
            if sub_directory in self.sub_directories:
                self.nfiles -= 1
                return self.sub_directories[sub_directory].remove_file('/'.join(path.split('/')[1:]))
            else:
                return None

    def rename_file(self, old_path, new_path, file, lines=None):

        file_data = self.remove_file(old_path)
        if file_data is not None:
            self.add_file(new_path, file_data['file'], file_data['lines'])
        else:
            self.add_file(new_path, file, lines=lines)

    def modify_file(self, path, file, lines=None):

        dirname = os.path.dirname(path)
        if dirname == '':
            if path not in self.files:
                self.files[path] = {
                    'file': file,
                    'lines': None
                }
            self.files[path]['lines'] = lines
        else:
            sub_directory = path.split('/')[0]
            if sub_directory not in self.sub_directories:  # create new directory if sub_directory not exists
                self.sub_directories[sub_directory] = Directory(name=sub_directory)
            self.sub_directories[sub_directory].modify_file('/'.join(path.split('/')[1:]), file, lines=lines)

    def clean_empty_folder(self):

        for k, v in self.sub_directories.items():
            v.clean_empty_folder()

        to_remove = []
        for k, v in self.sub_directories.items():
            if len(v.files) == 0 and len(v.sub_directories) == 0:
                to_remove.append(k)

        for k in to_remove:
            del self.sub_directories[k]

        return self

    def update_value(self, path, name, value):

        dirname = os.path.dirname(path)
        if dirname == '':
            if path in self.files:
                self.files[path][name] = value
                return value
            else:
                return None
        else:
            sub_directory = path.split('/')[0]
            if sub_directory not in self.sub_directories:
                return None
            else:
                return self.sub_directories[sub_directory]\
                    .update_value('/'.join(path.split('/')[1:]), name, value)

    def get_value(self, path, name):

        dirname = os.path.dirname(path)
        if dirname == '':
            if path in self.files and name in self.files[path]:
                return self.files[path][name]
            else:
                return None
        else:
            sub_directory = path.split('/')[0]
            if sub_directory not in self.sub_directories:
                return None
            else:
                return self.sub_directories[sub_directory]\
                    .get_value('/'.join(path.split('/')[1:]), name)

    def clean_print(self, level=0):
        ## print a depth first tranversal of the tree
        print('\t' * level + self.name + ' ' + str(self.nfiles))
        for directoryname in self.sub_directories:
            self.sub_directories[directoryname].clean_print(level=level + 1)
        for filename in self.files:
            print('\t' * (level + 1) + filename + ' ' + str(self.files[filename]['lines']))

    def update_with_commits(self, commits):
        # four change types Added, Deleted, Modified, or Renamed.
        for commit in commits:
            for modification in commit.modifications:
                if modification.change_type.name == 'ADD':
                    self.add_file(modification.new_path, '', lines=modification.nloc)
                if modification.change_type.name == 'DELETE':
                    self.remove_file(modification.old_path)
                if modification.change_type.name == 'RENAME':
                    self.rename_file(modification.old_path, modification.new_path, '', lines=modification.nloc)
                if modification.change_type.name == 'MODIFY':
                    self.modify_file(modification.old_path, '', lines=modification.nloc)

        return self

    def copy(self):
        ## obtain a copy of the directory
        root = Directory(name=self.name)

        root.nfiles = self.nfiles
        for k, v in self.sub_directories.items():
            root.sub_directories[k] = v.copy()
        for k, v in self.files.items():
            root.files[k] = v.copy()

        return root

    def to_json_tree(self):

        root = {}
        root['children'] = []
        for k, v in self.sub_directories.items():
            root['children'].append({
                'name': k,
                **v.to_json_tree()})

        for f, v in self.files.items():
            root['children'].append({
                'name': f,
                **v
            })

        return root

