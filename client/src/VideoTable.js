import { useState, useEffect } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Fab from '@mui/material/Fab';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

const EXPRESS_URL = 'https://bincherserver.run.goorm.site';

const ottItems = [
  { o_id: 1, o_name: 'netflix' },
  { o_id: 2, o_name: 'tving' },
  { o_id: 3, o_name: 'wavve' },
  { o_id: 4, o_name: 'coupang_play' },
  { o_id: 5, o_name: 'disney_plus' }
  // ... 추가적인 OTT 데이터
];

function VideoTable() {
  const [items, setItems] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOtt, setSelectedOtt] = useState([]);
  const [input, setInput] = useState({
    title: '',
    type: '',
    genre: '',
    country: '',
  });
	
  useEffect(() => {
    getItems();
  }, []);
	
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
	
  const getItems = async () => {
    try {
      const res = await axios.get(EXPRESS_URL + '/video');
      setItems(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteVideo = async (id) => {
    try {
      const res = await axios.delete(`${EXPRESS_URL}/video/delete/${id}`);
      console.log(res.data); // 응답 데이터 확인
      getItems(); // 업데이트된 목록 가져오기
    } catch (err) {
      console.log(err);
    }
  };

	const addVideo = async (video) => {
	  try {
		const res = await axios.post(EXPRESS_URL + '/video', video);
		console.log(res);
		getItems();
		setOpenDialog(false); // 비디오 추가 후 다이얼로그를 닫음
	  } catch (err) {
		console.log(err);
	  }
	};


const handleAddVideo = async () => {
    try {
      const videoData = {
        v_title: input.title,
        v_type: input.type,
        v_genre: input.genre,
        v_country: input.country,
        video_ott: selectedOtt.map((ott) => ott.o_id), // 선택된 ott 목록의 o_id만 저장
      };
      const res = await axios.post(`${EXPRESS_URL}/video`, videoData);
      console.log(res.data);
      getItems();
		setOpenDialog(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const video = {
        v_title: input.title,
        v_type: input.type,
        v_genre: input.genre,
        v_country: input.country,
        video_ott: selectedOtt.map((ott) => ott.o_id),
      };

      const res = await axios.post(EXPRESS_URL + '/video', video);
      console.log(res);
      getItems();
    } catch (err) {
      console.log(err);
    }
  };

  function handleSearchChange(event) {
    setSearchValue(event.target.value);
  }

  function filterItems() {
    if (searchValue === '') {
      return items;
    } else {
      return items.filter((video) => {
        const lowerCaseSearchValue = searchValue.toLowerCase();
        return (
          video.v_title.toLowerCase().includes(lowerCaseSearchValue) ||
          video.v_type.toLowerCase().includes(lowerCaseSearchValue) ||
          video.v_genre.toLowerCase().includes(lowerCaseSearchValue) ||
          video.v_country.toLowerCase().includes(lowerCaseSearchValue) ||
          video.video_ott.some((ott) =>
            ott.o_name.toLowerCase().includes(lowerCaseSearchValue)
          )
        );
      });
    }
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          top: (theme) => theme.spacing(2),
          right: (theme) => theme.spacing(2),
        }}
        onClick={handleOpenDialog}
      >
        <AddIcon />
      </Fab>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>비디오 추가</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            noValidate
            sx={{ mt: 1 }}
            onSubmit={handleSubmit}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  required
                  fullWidth
                  label="제목"
                  autoComplete="off"
                  autoFocus={true}
                  onChange={handleChange}
                  error={input.title === ""}
                  helperText={input.title === "" ? '비디오 제목을 입력하십시오.' : ''}
                />
              </Grid>
              <Grid item xs={12}>
				  <Autocomplete
					name="type"
					fullWidth
					label="타입"
					options={['drama', 'movie', 'animation', 'documentary', 'tvShow']}
					renderInput={(params) => (
					  <TextField {...params} label="타입" autoComplete="off" />
					)}
					onChange={(event, newValue) => {
					  setInput({
						...input,
						type: newValue || '', // Set the selected value or empty string
					  });
					}}
				  />
				</Grid>
              <Grid item xs={12}>
				  <TextField
					name="genre"
					fullWidth
					label="장르"
					autoComplete="off"
					select
					value={input.genre}
					onChange={handleChange}
				  >
					<MenuItem value="Action">액션</MenuItem>
					<MenuItem value="Romance">로맨스</MenuItem>
					<MenuItem value="Comedy">코미디</MenuItem>
					<MenuItem value="Thriller">스릴러</MenuItem>
					<MenuItem value="SF">SF</MenuItem>
					<MenuItem value="Fantasy">판타지</MenuItem>
					<MenuItem value="Horror">호러</MenuItem>
					<MenuItem value="Family">가족</MenuItem>
					<MenuItem value="Sports">스포츠</MenuItem>
					<MenuItem value="History">역사</MenuItem>
					<MenuItem value="Music">음악</MenuItem>
				  </TextField>
				</Grid>
              <Grid item xs={12}>
				  <TextField
					name="country"
					fullWidth
					label="나라"
					autoComplete="off"
					select
					value={input.country}
					onChange={handleChange}
				  >
					<MenuItem value="EN">영어</MenuItem>
					<MenuItem value="KR">한국어</MenuItem>
					<MenuItem value="JP">일본어</MenuItem>
					<MenuItem value="EU">유럽</MenuItem>
					<MenuItem value="Others">기타</MenuItem>
				  </TextField>
				</Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  id="ott-autocomplete"
                  options={ottItems} // OTT 데이터를 선택지로 사용
                  getOptionLabel={(option) => option.o_name}
                  filterSelectedOptions
                  value={selectedOtt}
                  onChange={(event, newValue) => {
                    setSelectedOtt(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="OTT"
                      placeholder="OTT 선택"
                    />
                  )}
                />
              </Grid>
            </Grid>
			  
            <Button
              disabled={!input.title}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
				onClick={handleAddVideo} 
				disabled={!input.title}
            >
              추가
            </Button>
			  <Button 
				  onClick={handleCloseDialog}
				  fullWidth
				  variant="contained"
				  >
				  취소
			  </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <TextField
        label="검색"
        variant="outlined"
        value={searchValue}
        onChange={handleSearchChange}
        sx={{ margin: '16px' }}
      />

      <TableContainer sx={{ maxHeight: 545 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>제목</TableCell>
              <TableCell>타입</TableCell>
              <TableCell>장르</TableCell>
              <TableCell>국가</TableCell>
              <TableCell>OTT</TableCell>
              <TableCell>삭제</TableCell> {/* 추가된 열 */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filterItems().map((video, i) => (
              <TableRow hover role="checkbox" key={i}>
                <TableCell>{video.v_title}</TableCell>
                <TableCell>{video.v_type}</TableCell>
                <TableCell>{video.v_genre}</TableCell>
                <TableCell>{video.v_country}</TableCell>
                <TableCell>
				  {video.video_ott.map((ott, index) => (
					<span
					  key={ott.o_id}
					  style={{
						width: '50px',
						height: '50px',
						display: 'inline-block',
						overflow: 'hidden',
					  }}
					>
					  <img
						src={`/images/${ott.o_name}.png`}
						alt={ott.o_name}
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					  />
					</span>
				  ))}
				</TableCell>
                <TableCell>
                  <Fab
                    color="secondary"
                    size="small"
                    onClick={() => deleteVideo(video.v_id)} // 삭제 버튼 클릭 시 deleteVideo 호출
                  >
                    <DeleteIcon />
                  </Fab>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default VideoTable;
