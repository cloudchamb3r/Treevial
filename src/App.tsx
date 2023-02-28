import { useRef, useState } from 'react'
import './App.css'
import TypoGraphy from '@mui/material/Typography'
import { TreeItem, TreeView, TreeItemProps } from '@mui/lab'
import { ExpandMore, ChevronRight, Edit, FileUploadOutlined, FileDownloadOutlined, PrintOutlined, Add, Description, Remove } from '@mui/icons-material'
import { Alert, Box, ButtonGroup, IconButton } from '@mui/material'
import { saveAs } from 'file-saver'

type MenuTreeItemProps = TreeItemProps & {
  label: string
  description?: string
};

interface MenuTreeItemData {
  label: string,
  description?: string
  subCategories?: [MenuTreeItemData],
}

const isMenuTreeItemData = (obj: object): obj is MenuTreeItemData =>
  'subCategories' in obj
    ? obj['subCategories']
      ? obj['subCategories'] instanceof Array
      : true
    : 'label' in obj && typeof (obj['label']) === 'string'

const MenuTreeItem = (props: MenuTreeItemProps) => {
  const {
    label,
    description,
    nodeId,
    ...other
  } = props;

  return (
    <TreeItem
      label={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 0.5, mr: 2 }}>
            <TypoGraphy sx={{display: 'flex', alignItems:'center'}}>
              {props.label}
              <TypoGraphy sx={{fontSize: 12 , px: 5}}>{props.description!}</TypoGraphy> 
            </TypoGraphy>

            <Box className="additional-handlers" sx={{
              '&:hover': {
                transition: 'opacity 0.4s',
                opacity: 1,
              },
              '&': {
                transition: 'opacity 0.4s',
                opacity: 0,
              }
            }}>
              <Edit
                sx={{ 
                  width: 16, 
                  px: 1,
                  color: 'grey',
                  ":hover": {
                    color: 'black'
                  },
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  console.log("width ")
                }} />
              <Add
                sx={{ 
                  width: 18, 
                  px: 1,
                  color: 'grey',
                  ":hover": {
                    color: 'black'
                  },
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  console.log(props);
                }} />

              <Description
                sx={{ 
                  width: 16, 
                  px: 1 ,
                  color: 'grey',
                  ":hover": {
                    color: 'black'
                  },
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("description onclick handler called!");
                }}
              />
            </Box>
          </Box>
      }
      nodeId={nodeId}
      {...other}
    />
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

  const nodeIdGenerator = function* () {
    let current = 1;
    while (true) {
      yield current.toString();
      current++;
    }
  }();

  const renderTree = (props?: MenuTreeItemData) => {
    if (props === undefined) return (<></>)
    const currentKey = nodeIdGenerator.next().value;
    return (
      <MenuTreeItem key={currentKey} nodeId={currentKey} label={props.label} description={props.description}>
        {props.subCategories?.map((node) => renderTree(node))}
      </MenuTreeItem>
    )
  };

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
        {renderTree(treeData)}
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
              throw new Error(`*rawData does not impelement MenuTreeItemData interface!!\n\trawData => ${_rawData}`);
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

export default App
