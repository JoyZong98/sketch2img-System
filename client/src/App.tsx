import axios from 'axios';
import Bluebird from 'bluebird';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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

  const loadFiles = useCallback(async () => {
    const req = await axios.get<{ rows: IWork[] }>('http://127.0.0.1:3000/api/works')
    setWorks(req.data.rows)
  }, [])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

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
    })
  }, [])

  const handleGenerateImage = useCallback(async () => {
    const file: Blob = await Bluebird.fromCallback((cb) => drawingBoardRef.current.canvas.toBlob((blob: Blob) => cb(null, blob)))
    const form = new FormData()
    form.append('file', file)
    await axios.post('http://127.0.0.1:3000/api/works', form)
    loadFiles()
  }, [loadFiles])

  return (
    <div className="App">
      <div className="flex items-center justify-center p-8 text-4xl font-extralight text-gray-600">
        Sketch2Image
      </div>

      <div id="drawing-board" className="bg-white w-1/2 h-96 mx-auto p-4 shadow-lg"></div>

      <div className="flex justify-center mt-8">
        <div className="bg-blue-500 px-4 py-2 rounded text-white" onClick={handleGenerateImage}>Generate</div>
      </div>

      <div className="flex flex-wrap justify-center -px-4 mt-8">
         {/* eslint-disable-next-line  */}
        {works.map((work) => <div key={work.id} className="bg-gray-300 w-64 h-48 mx-4 mb-4"><img className="w-full h-full" src={`http://127.0.0.1:3000/api/works/${work.id}/image.png`} /></div>)}
      </div>
    </div>
  );
}

export default App;
