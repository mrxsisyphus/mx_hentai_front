import {
  Clear as ClearIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import type React from 'react';
import { useMemo, useRef, useState } from 'react';
import API from '../../middleware/api';

const Config: React.FC = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [favoriteImport, setFavoriteImport] = useState('');
  const [fileImport, setFileImport] = useState<File | null>(null);
  const [isFuzzy, setIsFuzzy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preImportList, setPreImportList] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState(''); // 搜索查询状态

  // 为过滤后的列表定义逻辑
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) {
      return preImportList; // 如果没有搜索词，则返回所有项
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return preImportList.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerCaseQuery) ||
        (item.description &&
          item.description.toLowerCase().includes(lowerCaseQuery)),
    );
  }, [searchQuery, preImportList]);

  // 全选功能
  const handleSelectAll = () => {
    const allIds = new Set(filteredList.map((item) => item.id));
    setSelectedItems(allIds);
  };

  // 全不选功能
  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  // 反选功能
  const handleInvertSelection = () => {
    const newSelectedItems = new Set(selectedItems);
    filteredList.forEach((item) => {
      if (newSelectedItems.has(item.id)) {
        newSelectedItems.delete(item.id); // 如果已选中则取消选中
      } else {
        newSelectedItems.add(item.id); // 如果未选中则选中
      }
    });
    setSelectedItems(newSelectedItems);
  };

  // 处理搜索变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 打开导入弹窗
  const handleOpenImportDialog = () => {
    setImportDialogOpen(true);
  };

  // 关闭导入弹窗并重置相关状态
  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
    setFavoriteImport('');
    setFileImport(null);
    setIsFuzzy(false);
    setPreImportList([]);
    setSelectedItems(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理预导入
  const handlePreImport = async () => {
    if (!fileImport && !favoriteImport.trim()) {
      enqueueSnackbar('请上传文件或填写文本。', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    if (fileImport) {
      formData.append('file', fileImport);
    }
    if (favoriteImport.trim()) {
      formData.append('content', favoriteImport.trim());
    }
    formData.append('is_fuzzy', JSON.stringify(isFuzzy));

    try {
      const response = await API.post('/favorite/preImport', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { preImportList } = response.data.data;
      if (preImportList.length <= 0) {
        enqueueSnackbar('输入内容未找到匹配项,请重试', { variant: 'warning' });
        return;
      }
      setPreImportList(preImportList);
      enqueueSnackbar('预导入成功，请选择要导入的项。', { variant: 'success' });
    } catch (error: any) {
      console.error('预导入失败:', error);
      enqueueSnackbar(`预导入失败: ${error.message}`, { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理最终导入
  const handleFinalImport = async () => {
    if (selectedItems.size === 0) {
      enqueueSnackbar('请至少选择一项进行导入。', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await API.post('/favorite/import', {
        items: Array.from(selectedItems),
      });
      const { total } = response.data.data;
      enqueueSnackbar(`成功导入 ${total} 条数据`, { variant: 'success' });
      // 处理成功逻辑，例如刷新页面或更新状态
      handleCloseImportDialog();
    } catch (error: any) {
      console.error('导入失败:', error);
      enqueueSnackbar(`导入失败: ${error.message}`, { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 切换选择项
  const handleToggleItem = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // 处理导出
  const handleExport = async () => {
    window.open('/api/v1/favorite/export', '_blank');
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        配置页面
      </Typography>

      {/* Favorite 配置区域 */}
      <Box mb={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Favorite 设置
            </Typography>
            <Box>
              {/* 导入部分 */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Favorite 导入
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenImportDialog}
                >
                  导入
                </Button>
              </Box>

              {/* 导出部分 */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Favorite 导出
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleExport}
                >
                  导出
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 导入弹窗 */}
      <Dialog
        open={importDialogOpen}
        onClose={handleCloseImportDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>请选择你要导入的数据</DialogTitle>
        <DialogContent>
          {/* 导入过程的条件渲染 */}
          {!preImportList.length ? (
            <>
              <Box display="flex" flexDirection="column" gap={2}>
                {/* 或者填写文本 */}
                <TextField
                  label="或填写文本"
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  value={favoriteImport}
                  onChange={(e) => setFavoriteImport(e.target.value)}
                />

                {/* 显示选中的文件为 Chip（置于文本输入下方） */}
                <Box>
                  {!fileImport && (
                    <Button
                      variant="contained"
                      color="secondary"
                      component="label"
                    >
                      上传文件
                      <input
                        type="file"
                        accept=".txt" // 根据需要设置文件类型
                        hidden
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFileImport(e.target.files[0]);
                          }
                        }}
                      />
                    </Button>
                  )}
                  {/* 显示选中的文件为 Chip */}
                  {fileImport && (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      border={1}
                      borderColor="grey.400"
                      borderRadius="4px"
                      padding={1}
                      marginTop={1}
                    >
                      <Box display="flex" alignItems="center">
                        <FileIcon style={{ marginRight: '8px' }} />
                        <Typography variant="body1">
                          {fileImport.name}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setFileImport(null)}
                        startIcon={<DeleteIcon />}
                      >
                        删除
                      </Button>
                    </Box>
                  )}
                </Box>

                {/* 模糊搜索选项 */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isFuzzy}
                      onChange={(e) => setIsFuzzy(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="使用模糊搜索"
                />
              </Box>
            </>
          ) : (
            // 预导入结果列表
            <Box display="flex" flexDirection="column" gap={2}>
              {/* 搜索输入框 */}
              <Box display="flex" alignItems="center" marginTop={2}>
                <TextField
                  label="搜索内容"
                  variant="outlined"
                  // fullWidth
                  size="small"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  style={{ marginLeft: '8px' }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="clear search"
                        onClick={() => setSearchQuery('')}
                        edge="end"
                        size="small"
                      >
                        <ClearIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Box>

              {/* 控制按钮 */}
              <Box display="flex" gap={1} marginTop={1}>
                <Button
                  variant="contained"
                  onClick={handleSelectAll}
                  size="small"
                >
                  全选
                </Button>
                <Button
                  variant="contained"
                  onClick={handleInvertSelection}
                  size="small"
                >
                  反选
                </Button>
              </Box>

              {/* 列表 */}
              <Box
                style={{ maxHeight: '300px', overflowY: 'auto' }} // 设定最大高度及滚动条
              >
                <List>
                  {filteredList.length > 0 ? (
                    filteredList.map((item) => (
                      <ListItem
                        key={item.id}
                        button
                        onClick={() => handleToggleItem(item.id)}
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={selectedItems.has(item.id)}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{
                              'aria-labelledby': `checkbox-list-label-${item.id}`,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          id={`checkbox-list-label-${item.id}`}
                          primary={item.name}
                          secondary={item.description}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      无匹配的结果。
                    </Typography>
                  )}
                </List>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {isLoading && <CircularProgress size={24} />}
          {!preImportList.length ? (
            <>
              <Button onClick={handleCloseImportDialog} color="secondary">
                取消
              </Button>
              <Button
                onClick={handlePreImport}
                color="primary"
                variant="contained"
                disabled={isLoading}
              >
                预导入
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleCloseImportDialog}
                color="secondary"
                size="small"
              >
                取消
              </Button>
              <Button
                onClick={handleFinalImport}
                color="primary"
                variant="contained"
                disabled={isLoading}
                size="small"
              >
                导入选中
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Config;
