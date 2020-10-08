import React from "react";
import {map} from "lodash";

import { TreeView } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

import './directory-tree-view.scss';

class DirectoryTreeView extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            data: undefined
        }
    }

    render() {

        const {className, display} = this.props;
        const {width, height, maxHeight, padding} = this.props;
        const data = this.state.data || {};

        console.info(data)
        data.name = 'root';

        function tree(node) {
            if (node.children !== undefined && node.children.length > 0) {
                return <TreeItem nodeId={node.name} label={node.name} key={node.name}>
                    {map(node.children, c=>tree(c))}
                </TreeItem>
            }
            else {
                return  <TreeItem nodeId={node.name} label={node.name} key={node.name}/>
            }
        }

        return <div className={className} style={{
            width: width,
            paddingLeft: padding.left,
            paddingRight: padding.right,
            maxHeight: maxHeight
        }}>
            <TreeView
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              multiSelect>
                {tree(data)}
            </TreeView>
        </div>;
    }

}


DirectoryTreeView.defaultProps = {
    title: 'DirectoryTreeView',
    className: 'directory-tree-view',
    display: 'standalone', // or embedded
    padding: {
        top: 5, bottom: 5, left: 10, right: 10
    },
    width: 600,
    height: 600,
    maxHeight: 200
};

export default DirectoryTreeView;