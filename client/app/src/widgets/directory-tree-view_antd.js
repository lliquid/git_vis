import React from "react";
import './directory-tree-view.scss';
import { Tree } from 'antd';
import { join } from 'lodash';
const { DirectoryTree } = Tree;

class DirectoryTreeView extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            data: undefined
        }
    }

    onCheck(checkedKeys) {

        const treeData = this.state.data || {children:[]};
        const {onCheckUpdate} = this.props;

        const cleanCheck = function(node) {
            node.checked = false;
            if (node.children !== undefined && node.children.length > 0) {
                for (let child of node.children) {
                    cleanCheck(child);
                }
            }
        }

        cleanCheck(treeData);

        for (let key of checkedKeys) {
            let node = treeData;
            for (let k of key.split('-')) {
                node = node.children[Number(k)];
            }
            node.checked = true;
        }

        let selected_directories = [];
        const compress = function(node) {
            if (node.children !== undefined && node.children.length > 0) {
                let [allChecked, nonChecked] = [true, true];
                let checked_children = [];
                for (let child of node.children) {
                    if (!compress(child)) { allChecked = false;}
                    else { nonChecked = false; checked_children.push(child.key);}
                }
                if (allChecked && !nonChecked) {
                    return true;
                }
                else {
                    selected_directories = selected_directories.concat(checked_children);
                    return false;
                }
            }
            else {
                return node.checked;
            }
        }

        compress(treeData);

        let selected_directories_translated = [];
        for (let key of selected_directories) {
            let node = treeData;
            let path = [];
            for (let k of key.split('-')) {
                node = node.children[Number(k)];
                path.push(node.name);
            }
            selected_directories_translated.push(join(path, '/'))
        }

        onCheckUpdate(selected_directories_translated);

    }


    render() {

        const {className, display} = this.props;
        const {width, height, maxHeight, padding} = this.props;
        const treeData = this.state.data || {children:[]};

        const toAntDTree = function(node, id) {
            node.title = node.name;
            node.key = join(id, '-');
            let file_count = 0;
            if (node.children !== undefined && node.children.length > 0) {
                node.children.forEach((n, i) => {
                    file_count += toAntDTree(n, id.slice(0).concat([i]))
                })
            }
            else {
                node.isLeaf = true;
                file_count = 1;
            }
            if (!node.isLeaf) {node.title += ' (' + file_count + ' files)';}
            return file_count;
        }

        toAntDTree(treeData, []);

        return <div className={className} style={{
            width: width,
            paddingLeft: padding.left,
            paddingRight: padding.right,
            maxHeight: maxHeight
        }}>
            <DirectoryTree
              checkable
              onCheck={this.onCheck.bind(this)}
              treeData={treeData.children}
            />
        </div>;
    }

}


DirectoryTreeView.defaultProps = {
    title: 'DirectoryTreeView',
    className: 'directory-tree-view',
    display: 'standalone', // or embedded
    padding: {
        top: 5, bottom: 5, left: 5, right: 5
    },
    onCheckUpdate: ()=>{},
    width: 600,
    height: 600,
    maxHeight: 200
};

export default DirectoryTreeView;