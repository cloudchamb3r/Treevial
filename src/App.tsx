import { useRef, useState } from 'react'
import './App.css'
import TypoGraphy from '@mui/material/Typography'
import { TreeItem, TreeView, TreeItemProps } from '@mui/lab'
import { ExpandMore, ChevronRight, Edit, FileUploadOutlined, FileDownloadOutlined, PrintOutlined, Add, Description, Remove, Close } from '@mui/icons-material'
import { Alert, Box, ButtonGroup, IconButton } from '@mui/material'
import { saveAs } from 'file-saver'



interface MenuTreeItemData {
  label: string,
  description?: string
  subCategories?: [MenuTreeItemData],
}

type MenuTreeItemProps = TreeItemProps & MenuTreeItemData;


const isMenuTreeItemData = (obj: object): obj is MenuTreeItemData =>
  'subCategories' in obj
    ? obj['subCategories']
      ? obj['subCategories'] instanceof Array
      : true
    : 'label' in obj && typeof (obj['label']) === 'string';
 


// I think this is evil 
const nodeIdGenerator = function* () {
  let current = 1;
  while (true) {
    yield current.toString();
    yield current.toString();
    current++;
  }
}();

const MenuTreeItem = ({label, description, nodeId, subCategories, ...other}: MenuTreeItemProps) => {
  const [nodeData, setNodeData] = useState<MenuTreeItemData | null>({label, description, subCategories});


  const boxStyle = { '&:hover': { transition: 'opacity 0.4s', opacity: 1 },'&': { transition: 'opacity 0.4s',opacity: 0 }}
  const iconStyle = { width: 16, px: 1, color: 'grey', ':hover': {color: 'black'} };

  if (nodeData == null) return (<></>)
  return (
    <TreeItem
      label={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 0.5, mr: 2 }}>
            <TypoGraphy sx={{display: 'flex', alignItems:'center'}}>
              {nodeData.label}
              <TypoGraphy sx={{fontSize: 12 , px: 5}}>{nodeData.description!}</TypoGraphy> 
            </TypoGraphy>

            <Box className="additional-handlers" sx={boxStyle}>
              <Edit
                sx={iconStyle}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("edit clicked ")
                }} />
              <Add
                sx={iconStyle}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('add clicked!');
                }} />

              <Description
                sx={iconStyle}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("description clicked!");
                }}
              />

              <Close
                sx={iconStyle}
                onClick={ e => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('close clicked!')
                  setNodeData(null);
                }}
              />
            </Box>
          </Box>
      }
      nodeId={nodeId}
      {...other}
    >
      {nodeData.subCategories?.map((child) => <MenuTreeItem 
          key={nodeIdGenerator.next().value} 
          nodeId={nodeIdGenerator.next().value} 
          label={child.label} 
          description={child.description}
          subCategories={child.subCategories}  
        />)}
    </TreeItem>
  );
}


function App() {
  const inputFile = useRef<HTMLInputElement>(null);
  const [treeData, setTreeData] = useState<MenuTreeItemData>({
    label: 'Top parent',
    subCategories: [
      {
        label: 'test1'
      }
    ]
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }} color='primary'>
      <ButtonGroup size="medium" sx={{ alignSelf: 'flex-end' }} >
        <IconButton
          color='primary'
          children={<FileUploadOutlined />}
          onClick={() => {
            inputFile.current?.click();
          }} />
        <IconButton
          color='primary'
          children={<FileDownloadOutlined />}
          onClick={() => {
            const file = new File([JSON.stringify(treeData)], 'out.json');
            saveAs(file);
          }} />
        <IconButton
          color='primary'
          children={<PrintOutlined />}
          onClick={() => setTimeout(() => window.print(), 500)}
        />
      </ButtonGroup>

      <TreeView
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        defaultEndIcon={<Remove sx={{ width: 11 }}/>}
        sx={{ height: '100%', flexGrow: 0, maxWidth: '100vw', overflow: 'hidden' }}
      >
        {<MenuTreeItem 
            key={nodeIdGenerator.next().value} 
            nodeId={nodeIdGenerator.next().value} 
            label={treeData.label} 
            description={treeData.description}
            subCategories={treeData.subCategories}  
        />}
      </TreeView>

      <input type="file" ref={inputFile} style={{ display: 'none' }} onChange={(e) => {
        if (e.target.files && e.target.files.length > 0) {
          const currentFile = e.target.files[0];

          const fileReader = new FileReader();
          fileReader.onload = () => {
            try {
              const _rawData: string = fileReader.result?.toString() ?? ""
              const obj = JSON.parse(_rawData);
              if (isMenuTreeItemData(obj)) {
                setTreeData(obj);
                return;
              }
              throw new Error(`[!] rawData does not impelement MenuTreeItemData interface!!\n\trawData => ${_rawData}`);
            } catch (ex) {
              console.error(ex)
            }
          }
          fileReader.readAsText(currentFile);
        }
      }} />
    </Box>
  )
}

export default App;
