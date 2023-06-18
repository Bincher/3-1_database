import { useState, useEffect } from 'react';
import './VideoTable.css';
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import RateReviewIcon from '@mui/icons-material/RateReview';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

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
    const [editMode, setEditMode] = useState(false);
    const [selectedOtt, setSelectedOtt] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [openReviewDialog, setOpenReviewDialog] = useState(false);
    const [selectedVideoForReview, setSelectedVideoForReview] = useState(null);
    const [nickname, setNickname] = useState('');
    const [review, setReview] = useState('');
    const [evaluation, setEvaluation] = useState([]);
    const [input, setInput] = useState({
        title: '',
        type: '',
        genre: '',
        country: '',
    });

	
    useEffect(() => {
        getItems();
        fetchEvaluationData();
    }, []);

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };
    const handleCloseDialog = () => {
        setEditMode(false);
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

    const handleEditVideo = (video) => {
        setSelectedVideo(video);
        setInput({
            title: video.v_title,
            type: video.v_type,
            genre: video.v_genre,
            country: video.v_country
        });
        setSelectedOtt(video.video_ott);
        setEditMode(true); // 편집 모드로 설정
        setOpenDialog(true);

    };

    const handleAddVideo = async () => {
        try {
            if (editMode === true) {
                // 수정 로직
                const videoData = {
                    v_title: input.title,
                    v_type: input.type,
                    v_genre: input.genre,
                    v_country: input.country,
                    video_ott: selectedOtt.map((ott) => ott.o_id),
                };

                const res = await axios.put(`${EXPRESS_URL}/video/${selectedVideo.v_id}`, videoData);
                console.log(res.data);
            } else {
                // 추가 로직
                const videoData = {
                    v_title: input.title,
                    v_type: input.type,
                    v_genre: input.genre,
                    v_country: input.country,
                    video_ott: selectedOtt.map((ott) => ott.o_id),
                };

                const res = await axios.post(`${EXPRESS_URL}/video`, videoData);
                console.log(res.data);
            }

            getItems();
            setEditMode(false); // editMode 초기화
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

    const handleAddReview = (videoId) => {
        setSelectedVideoForReview(videoId);
        setOpenReviewDialog(true);

        axios.get(`${EXPRESS_URL}/video/${videoId}/evaluation`)
            .then(response => {
                setEvaluation(response.data);
            })
            .catch(error => {
                console.error('Error fetching evaluation data:', error);
            });
        console.log(evaluation);
    };

    const handleSaveReview = () => {
        // 사용자가 입력한 닉네임과 평가 내용
        const nicknameValue = nickname;
        const content = review;

        // 평가 저장을 위한 백엔드 API 호출
        axios.post(`${EXPRESS_URL}/video/${selectedVideoForReview}/evaluation`, {
            nickname: nicknameValue,
            content: content
        })
            .then(response => {
                console.log('평가가 수정되었습니다.');
                // 평가가 수정되었으니 다시 데이터를 가져옴
                axios.get(`${EXPRESS_URL}/video/${selectedVideoForReview}/evaluation`)
                    .then(response => {
                        setEvaluation(response.data);
                    })
                    .catch(error => {
                        console.error('Error fetching evaluation data:', error);
                    });
            })
            .catch(error => {
                console.error('Error saving evaluation:', error);
            });

        // 다이얼로그 닫기
        setOpenReviewDialog(false);
    };

    const fetchEvaluationData = async () => {
        try {
            const res = await axios.get(`${EXPRESS_URL}/video/${selectedVideoForReview}/evaluation`);
            setEvaluation(res.data);
        } catch (err) {
            console.log(err);
        }
    };

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

            <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>닉네임</TableCell>
                                <TableCell>평가</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {evaluation.map((evaluationItem) => (
                                <TableRow key={evaluationItem.e_id}>
                                    <TableCell>{evaluationItem.e_nickname}</TableCell>
                                    <TableCell>{evaluationItem.e_content}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <DialogTitle>평가 작성</DialogTitle>
                <DialogContent>
                    <TextField
                        label="닉네임"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="평가"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenReviewDialog(false)}>취소</Button>
                    <Button onClick={handleSaveReview}>저장</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>비디오 추가 밑 변경</DialogTitle>
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
                        >
                            저장
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
                            <TableCell>설정</TableCell> {/* 추가된 열 */}
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
                                    <Fab
                                        color="secondary"
                                        size="small"
                                        onClick={() => handleEditVideo(video)} // 수정 버튼 클릭 시 handleEditVideo 함수 호출
                                    >
                                        <EditIcon />
                                    </Fab>
                                    <Fab
                                        color="primary"
                                        size="small"
                                        onClick={() => handleAddReview(video.v_id)} // 평가 버튼 클릭 시 handleAddReview 함수 호출
                                    >
                                        <RateReviewIcon />
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
