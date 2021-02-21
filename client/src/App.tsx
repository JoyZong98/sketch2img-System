/* eslint-disable */ 
import { Select, Spin } from 'antd';
import axios from 'axios';
import Bluebird from 'bluebird';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import 'antd/dist/antd.css';
// import { addSyntheticLeadingComment } from 'typescript';
// eslint-disable-next-line
const { Option } = Select;
export interface IWork {
  id:             number;
  name:           string;
  inputFilePath:  string;
  outputFilePath: string;
  isPublished:    boolean;
  createdAt:      string;
  updatedAt:      string;
}

const App: React.FC = () => {
  const drawingBoardRef = useRef<any>()

  const [works, setWorks] = useState<IWork[]>([])
  const [curImagePath,setCurImagePath] = useState<string>();
  const [uploadImagePath,setUploadImagePath] = useState<string>();
  const [curModel,setCurModel] = useState<string>();
  const [sketchBlob, setSketchBlob] = useState<Blob>();
  const [spinning, setSpinning] = useState<boolean>();

  const loadFiles =async () => {
    const req = await axios.get<{ rows: IWork[] }>('http://127.0.0.1:3000/api/works')
    setWorks(req.data.rows)
  }

  //初始化
  useEffect(() => {
    setCurModel('ours');
    setSpinning(false);
  },[])

  useEffect(() => {
    drawingBoardRef.current = new DrawingBoard.Board('drawing-board', {
      controls: [
        'Color',
        { Size: { type: 'dropdown' } },
        { DrawingMode: { filler: false } },
        'Navigation',
        'Download'
      ],
      size: 1,
      webStorage: 'session',
      enlargeYourContainer: true
    });
  }, [])
  useEffect(()=>{},[spinning]);

  useEffect(()=>{
    const uploadBoard = document.getElementById('drawing-upload');
    if(uploadBoard ){
      uploadBoard.hidden = true;
    }
  },[])



  useEffect(() => {
    loadFiles();
  },[curImagePath])

  const handleUpload=(ev:any)=>{
    const fileList = ev.target.files
    const fileObject = fileList[0];
    
    const board = document.getElementById('drawing-board');
    if(board){
      board.hidden = true;
    }
    const uploadBoard = document.getElementById('drawing-upload');
    if(uploadBoard && fileObject){
      uploadBoard.hidden = false;
      const url = window.URL.createObjectURL(fileObject);
      setUploadImagePath(url);
      setSketchBlob(fileObject);
      }
    };

  const handleGenerateImage = async () => {
    const form = new FormData()
    if(sketchBlob){
      form.append('file', sketchBlob)
    }else{
      const file: Blob = await Bluebird.fromCallback((cb) => drawingBoardRef.current.canvas.toBlob((blob: Blob) => cb(null, blob)))
      form.append('file', file)
    }
    await axios.post(`http://127.0.0.1:3000/api/works?model=${curModel}`,form);
    const req = await axios.get(`http://127.0.0.1:3000/api/works`);
    setTimeout(()=>{ 
      setWorks(req.data.rows);
      setCurImagePath(`http://127.0.0.1:3000/api/works/${req.data.rows[0].id}/image.png`);
      setSpinning(false);
    }, 3000); 
    
  }

  return (
    <div className="App">
      {/* navbar */}
      <div className="navbar">
        <div className="navbar-title flex items-center justify-center" >
          Sketch2Image
        </div>
      </div>

      {/* input area */}
      <div className="blue-bg">
      <div className="input-content" >
        <div className="input-column ">
          <div className="input-tips-area ">
            <p>Draw a sketch, or load a file to begin.</p>
          </div>
          <div className="input-area">
            <div className="drawing-board-label"><span>INPUT</span></div>
            <div className="flex">
            <div id="drawing-board"></div>
            <div >
              <img id="drawing-upload" src={uploadImagePath} />
            </div>
            </div>
          </div>
          <div className="model-select-area">
            <div className="model-select-label">Current Model</div>
              <Select className="model-select " defaultValue="ours" onSelect={(value)=>{
                  setCurModel(value);
              }}>
                <Option value="ours">Default</Option>
                <Option value="pix2pix">Pix2Pix</Option>
                <Option value="disabled" disabled>SketchGAN</Option>
              </Select>
            <div className="model-select-label">
              <form id="upload-form" action="/upload-single" method="post" encType="multipart/form-data" >    
                <input type="file" id="upload-input" accept="image/*" name="file" onChange={(ev)=>handleUpload(ev)}/>
              </form>
            </div>
          </div>
        </div>
        
        <div className="generate-button" onClick={()=>{
          setSpinning(true);
          handleGenerateImage();
        }}>Generate</div>
      </div>
      </div>
      {/* output area */}
      <div className="grey-bg">
        <div className="output-content" >
        <div className="output-area">
          <div className="output-content-label"><span>OUTPUT</span></div>
          <Spin spinning={spinning}>
            <div id="output-image">
              <img src={curImagePath} />
            </div>
          </Spin>
        </div>
        </div>
      </div>
      
      {/* transform history area */}
      <div className="history-content">
        <div className="history-area ">
          {/* eslint-disable-next-line  */}
          {works.sort((a,b)=>b.id-a.id).map((work) => <div key={work.id} className="history-image"><img src={`http://127.0.0.1:3000/api/works/${work.id}/image.png`} /></div>)}
        </div>
      </div>

      {/* introduction about model */}
      <div className="intro-content"><div className="intro-area">
        <section id="about">
          <h2 className="intro-title">About</h2>
          <hr/>
          <div className="columns is-centered">
            <div className="column is-10-tablet is-8-desktop is-6-widescreen">
              <div className="intro-text has-text-centered-tablet">
              <p>We often use sketching to visualize scenes or objects. Sketching based image synthesis enables novices to create realistic images without a lot of professional knowledge.
                It is a challenging problem to synthesize realistic images with such sketches.
                Because the sketch is usually very simple and imperfect, and novice painters can not draw a sketch that can accurately reflect the boundary of the object. 
              </p>
              <p>Realistic images synthesized from sketches should respect the artist's intention as much as possible, but they may need to deviate from rough strokes to produce natural images. 
                More importantly, freehand sketches are usually incomplete, with images containing foreground and background. 
                Users usually prefer to draw the foreground object they care about most with a specific detailed appearance, while leaving a blank space for them to draw the background object roughly. 
                The authenticity of the images generated by the existing methods will be affected by the over fitting of the original sketch edges or the clutter of the background.
              </p>
              <p>Therefore, we propose a multi-stage generation confrontation network model. 
                By introducing the edge graph of the original data, we construct a two-stage network from sketch to edge graph and from edge graph to image, so as to improve the authenticity of the image and refine the generated image.
              </p>
              </div>
            </div>
          </div>
        </section>
      </div></div>
    </div>
  );
}

export default App;
