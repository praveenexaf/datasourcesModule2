import { NestedTreeControl } from '@angular/cdk/tree';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import {
  Component,
  VERSION,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  NgModule,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray } from '@angular/forms';
import { MatTreeNestedDataSource } from '@angular/material/tree';

export interface TreeNode {
  name: string;
  nodes: TreeNode[];
}

export interface Tree {
  name: string;
  nodes: TreeNode[];
}

export interface joinCondition {
  parent: string;
  child: string;
}

export interface TreeNode {
  name: string;
  table: string;
  select: string[];
  where: string;
  limit: number;
  sampler: string;
  join: joinCondition[];
  nodes: TreeNode[];
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  samplerCheck: Boolean;
  tableName: string;
  tableAlias: string;
  activeNode: TreeNode;
  showAddNodeForm: Boolean;
  showNodeConfigForm: Boolean;
  nestedDataSource = new MatTreeNestedDataSource<TreeNode>();
  nestedTreeControl = new NestedTreeControl<TreeNode>((node) => node.nodes);

  nodeConfigForm: FormGroup;
  addNodeForm: FormGroup;
  newCondition: joinCondition = { parent: '', child: '' };

  dropdownSettings: IDropdownSettings = {};

  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef) {
    this.showAddNodeForm = false;
    this.showNodeConfigForm = true;
    this.nestedDataSource.data = [
      {
        name: 'root',
        table: 'acfc_poc.dim_prvdr',
        select: ['*'],
        where: 'prvdr_key in (1,2,3,4)',
        limit: 5,
        sampler: 'prvdr_key in (1,2,3,4)',
        join: [],
        nodes: [],
      },
    ];
    this.setActiveNode(this.nestedDataSource.data[0]);

    this.nodeConfigForm = this.fb.group({
      table: this.fb.control(this.activeNode['table'], []),
      select: this.fb.array(this.activeNode['select'], []),
      where: this.fb.control(this.activeNode['where'], []),
      sampler: this.fb.control(this.activeNode['sampler'], []),
      limit: this.fb.control(this.activeNode['limit'], []),
      join: this.fb.array([], []),
    });
  }

  setActiveNode(node: TreeNode) {
    if (node) {
      this.activeNode = node;
      console.log('activeNode - ');
      console.log(this.activeNode);
    }
  }

  openAddNodeForm(parent: TreeNode) {
    this.setActiveNode(parent);
    this.showNodeConfigForm = false;
    this.showAddNodeForm = true;
  }

  openNodeConfigForm(parent: TreeNode) {
    this.setActiveNode(parent);
    console.log('openingNodeConfigForm');
    this.nodeConfigForm = this.fb.group({
      table: this.fb.control(this.activeNode['table'], []),
      select: this.fb.array(this.activeNode['select'], []),
      where: this.fb.control(this.activeNode['where'], []),
      sampler: this.fb.control(this.activeNode['sampler'], []),
      limit: this.fb.control(this.activeNode['limit'], []),
      join: this.fb.array(
        this.activeNode['join'].map((x) => this.fb.control({parent:x.parent,child:x.child}, []))
      ),
    });
    console.log(this.nodeConfigForm);
    this.showAddNodeForm = false;
    this.showNodeConfigForm = true;
    // console.log(this.activeNode['join'].map((x) => this.fb.control({parent: this.fb.control(x.parent),child:this.fb.control(x.child)}, [])));
  }

  getSelectValues() {
    if (this.activeNode) {
      return ['column1', 'column2', 'column3'];
    }
  }

  addNode() {
    const newNode: TreeNode = {
      // Create a new node object
      name: this.tableAlias,
      table: this.tableName,
      select: [],
      where: '',
      limit: null,
      sampler: '',
      join: [{ parent: '', child: '' }],
      nodes: [],
    };
    console.log('Active Node: ');
    console.log(this.activeNode);
    if (!this.activeNode.nodes) {
      this.activeNode.nodes = [];
    } else {
      this.activeNode.nodes.push(newNode);
    }
    this.setActiveNode(newNode);
    this.openNodeConfigForm(newNode);
    this.tableName = '';
    this.tableAlias = '';
    this.showAddNodeForm = false;
    this.showNodeConfigForm = true;
    console.log('Added new Node');
    console.log(this.nestedDataSource.data[0]);
    this.nestedDataSource.data = [...this.nestedDataSource.data];
    this.refreshTree();
  }
  deleteNode(
    nodeToDelete: TreeNode,
    parentNode: TreeNode | null = null,
    nodes: TreeNode[] = this.nestedDataSource.data
  ): boolean {
    for (let i = 0; i < nodes.length; i++) {
      const currentNode = nodes[i];
      if (currentNode === nodeToDelete) {
        // Node found, delete it from parent's nodes array
        if (parentNode) {
          const index = parentNode.nodes.indexOf(nodeToDelete);
          if (index !== -1) {
            parentNode.nodes.splice(index, 1);
            console.log(true);
            this.refreshTree();
            this.showNodeConfigForm=false;
            return true; // Node deleted successfully
          }
        } else {
          // If parentNode is null, it means we are deleting the root node
          this.nestedDataSource.data.splice(i, 1);
          console.log(true);
          this.refreshTree();
          this.showNodeConfigForm=false;
          return true; // Root node deleted successfully
        }
      } else if (currentNode.nodes && currentNode.nodes.length > 0) {
        // Recursively search in children
        const deleted = this.deleteNode(
          nodeToDelete,
          currentNode,
          currentNode.nodes
        );
        if (deleted) {
          console.log(true);
          this.refreshTree();
          this.showNodeConfigForm=false;
          return true; // Node deleted successfully
        }
      }
    }
    console.log(false);

    return false; // Node not found
  }
  refreshTree() {
    console.log('refreshing Tree');
    let _data = this.nestedDataSource.data;
    this.nestedDataSource.data = null;
    this.nestedDataSource.data = _data;
  }
  get _conditionsFormArray() : FormArray{
    return this.nodeConfigForm.get("join") as FormArray;
  }

  addJoinCondition() {
    this._conditionsFormArray.push(this.fb.control({parent:"",child:""}));
    console.log(this._conditionsFormArray);
  }
  deleteCondition(i:number) {
    this._conditionsFormArray.removeAt(i)
  }
  _isRootNode(node: TreeNode) {
    return node?.name == 'root';
  }
  
  _hasNestedChild(index: number, node: TreeNode) {
    console.log('Inside hasNestedChild');
    console.log(node);
    return node?.nodes?.length > 0;
  }

  // saveActiveNode(){
  //   console.log("saving Node");
  //   this.activeNode={
  //     name: this.activeNode.name,
  //     table: this.activeNode.table,
  //     select: this.nodeConfigForm.get('select').value,
  //     where: this.nodeConfigForm.get('where').value,
  //     sampler: this.nodeConfigForm.get("sampler").value,
  //     limit: this.nodeConfigForm.get('limit').value,
  //     join: this.nodeConfigForm.get('join').value,
  //     nodes: this.activeNode.nodes
  //   }
  //   console.log("saved Node");
  //   console.log(this.activeNode);
  //   console.log(this.nestedDataSource.data);
  // }

  saveActiveNode(
    nodeToUpdate: TreeNode = this.activeNode,
    nodes: TreeNode[] = this.nestedDataSource.data
  ): boolean {
    for (let i = 0; i < nodes.length; i++) {
      const currentNode = nodes[i];
      if (currentNode === nodeToUpdate) {
        // Node found, update its properties
        const newNodeData = {
          name: this.activeNode.name,
          table: this.activeNode.table,
          select: this.nodeConfigForm.get('select').value,
          where: this.nodeConfigForm.get('where').value,
          sampler: this.nodeConfigForm.get('sampler').value,
          limit: this.nodeConfigForm.get('limit').value,
          join: this.nodeConfigForm.get('join').value,
          nodes: this.activeNode.nodes,
        };
        Object.assign(currentNode, newNodeData);
        return true; // Node updated successfully
      } else if (currentNode.nodes && currentNode.nodes.length > 0) {
        // Recursively search in children
        const updated = this.saveActiveNode(nodeToUpdate, currentNode.nodes);
        if (updated) {
          return true; // Node updated successfully
        }
      }
    }
    return false; // Node not found
  }
  getConfig(){
    return this.nestedDataSource.data[0];
  }
}
