import { useState } from 'react';
import './App.css';
import InputMatrix from './view/InputMatrix'
import DisplayMatrix from './view/DisplayMatrix'
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';


import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Matrix from './model/matrix'

function createData(
  consept: string,
  cons_system_on_concept: number,
  dis_system_on_concept: number,
  cons_concept_on_system: number,
  dis_concept_on_system: number,
  infl_system_on_concept,
  infl_concept_on_system
) {
  return { consept, cons_system_on_concept, dis_system_on_concept, cons_concept_on_system, dis_concept_on_system, infl_system_on_concept, infl_concept_on_system };
}

function validate(matrix) {
  let n = matrix.length;
  let new_data = [];
  for (let i = 0; i < n; i++)
  {
    new_data[i] = []; 
    for (let j = 0; j < matrix[i].length; j++)
    {
      let parsed = parseFloat(matrix[i][j]);
      if (isNaN(parsed)) {
        return {"parsed": [], "isValid": false};
      }
      new_data[i][j] = parsed;
    }
  }
  return {"parsed": new_data, "isValid": true};
}

function App() {
  const [concepts, setConcepts] = useState([
    "Население города",
    "Миграции в город",
    "Модернизация",
    "Свалки",
    "Санитарное состояние",
    "Заболевание на тысячу человек",
    "Бактерии"
  ])
  const [data, setData] = useState([
    [0, 0, .6, .9, 0, 0, 0],
    [.1, 0, 0, 0, 0, 0, 0],
    [0, .7, 0, 0, .9, 0, 0],
    [0, 0, 0, 0, 0, 0, .9],
    [0, 0, 0, 0, 0, -.9, -.9],
    [-.3, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, .8, 0]
  ]);
  
  

  function setIJ(i, j, value) {
    let new_data = [...data];
    new_data[i][j] = value.replace(",",".");
    setData(new_data)
  }
  var {parsed, isValid} = validate(data);
  let info;
  if (isValid) {
    // step 1
    let A = new Matrix(7, 7, parsed);
    let {res: B, steps: steps1} = A.toOddMap();
    // step 2
    let {res: C, steps: steps2} = B.transitive_closure();
    // step 3
    let {res: D, steps: steps3} = C.positive_negative();
    
    // step 4
    let {res: cons, steps: steps4_1} = D.get_consonans_matrix();
    let {res: dis, steps: steps4_2} = D.get_disonans_matrix();
    let {res: infl, steps: steps4_3} = D.get_influence_matrix();
  
    let cons_system_on_concept = Matrix.transpose(cons.data).map((el) => el.reduce((partialSum, a) => partialSum + a, 0)/cons.rows_count);
    let dis_system_on_concept = cons_system_on_concept.map(el => 1 -el);
    
    let cons_concept_on_system = cons.data.map((el) => el.reduce((partialSum, a) => partialSum + a, 0)/cons.rows_count);
    let dis_concept_on_system = cons_concept_on_system.map(el => 1 -el);
  
    let infl_concept_on_system = Matrix.transpose(infl.data).map((el) => el.reduce((partialSum, a) => partialSum + a, 0)/cons.rows_count);
    let infl_system_on_concept = infl.data.map((el) => el.reduce((partialSum, a) => partialSum + a, 0)/cons.rows_count);

    let rows = []
    for (let i = 0; i < 7; i++) {
      rows.push(createData(
        concepts[i],
        Number(cons_system_on_concept[i]).toFixed(2),
        Number(dis_system_on_concept[i]).toFixed(2),
        Number(cons_concept_on_system[i]).toFixed(2),
        Number(dis_concept_on_system[i]).toFixed(2),
        Number(infl_system_on_concept[i]).toFixed(2),
        Number(infl_concept_on_system[i]).toFixed(2)
      ));
    }
    info = (
      <div>
        <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Шаг 1. Перейти к нечетной карте</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <BlockMath math={steps1}/>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>Шаг 2. Найти транзитивное замыкание</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <BlockMath math={steps2}/>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <Typography>Шаг 3. Построить "эврестическое" транзитивное замыкание</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <BlockMath math={steps3}/>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel4a-content"
          id="panel4a-header"
        >
          <Typography>Шаг 4. Построить матрицы консонанса, дисонанса и влияния</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <BlockMath math={steps4_1}/>
          <BlockMath math={steps4_2}/>
          <BlockMath math={steps4_3}/>
        </AccordionDetails>
      </Accordion>
      
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Название Концептов</TableCell>
            <TableCell align="right">Консонанс влияния системы</TableCell>
            <TableCell align="right">Дисонанс влияния системы</TableCell>
            <TableCell align="right">Консонанс влияния концепта</TableCell>
            <TableCell align="right">Дисонанс влияния концепта</TableCell>
            <TableCell align="right">Влияние системы на концепт</TableCell>
            <TableCell align="right">Влияния концепта на систему</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.consept}
              </TableCell>
              <TableCell align="right">{row.cons_system_on_concept}</TableCell>
              <TableCell align="right">{row.dis_system_on_concept}</TableCell>
              <TableCell align="right">{row.cons_concept_on_system}</TableCell>
              <TableCell align="right">{row.dis_concept_on_system}</TableCell>
              <TableCell align="right">{row.infl_concept_on_system}</TableCell>
              <TableCell align="right">{row.infl_system_on_concept}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
      </div>
    )
  }
  
  return (
    <div>
      <h3>Список концептов</h3>
      <ol>
        {concepts.map((el, index) =>
          <li key={index}>
            <span>{el}</span>
            {/* <a href="" onClick={event => {
              event.preventDefault();
              let new_concepts = [...concepts.slice(0, index), ...concepts.slice(index+1)];
              setConcepts(new_concepts);
            }}> удалить</a> */}
          </li>
          )}
      </ol>
      {/* <input type="text" id="new_concept"/> */}
      {/* <button onClick={event => {
        event.preventDefault();
        let concept = document.querySelector("#new_concept").value;
        setConcepts([...concepts, concept]);
      }}>добавить концепт</button> */}
      <InputMatrix
        rows={4}
        columns={4}
        data={data}
        concepts={concepts}
        setIJ={setIJ}
      />
      {info}
    </div>
  );
}

export default App;
