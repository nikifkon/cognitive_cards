import { useEffect, useState } from 'react';
import { BlockMath } from 'react-katex';

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

import { LineChart, Line, XAxis, YAxis, Legend, Tooltip, ReferenceLine } from 'recharts';

import Matrix from '../model/matrix'
import { T_norm } from '../model/T-norm'

import './MainTable.css'

const DEFAULT_EPSILON = 0.01;
const DEFAULT_LIMIT = 100;

function createData(
    consept,
    cons_system_on_concept,
    dis_system_on_concept,
    cons_concept_on_system,
    dis_concept_on_system,
    infl_system_on_concept,
    infl_concept_on_system
  ) {
    return { consept, cons_system_on_concept, dis_system_on_concept, cons_concept_on_system, dis_concept_on_system, infl_system_on_concept, infl_concept_on_system };
  }
 

function validate(matrix) {
    let n = matrix.length;
    let new_data = [];
    if (n === 0) return {"parsed": [], "isValid": false}
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

function MainTable({data, concept_list}) {
    const n = concept_list.length;
    const [concepts, setConcepts] = useState(() => {
        let d = {}
        concept_list.forEach(concept => d[concept] = 0)
        return d
    });
    const [epsilon, setEpsilon] = useState(() => {
        return DEFAULT_EPSILON;
    })
    const [limit, setLimit] = useState(() => {
        return DEFAULT_LIMIT;
    })

    useEffect(() => {
        let d = {}
        concept_list.forEach(concept => d[concept] = 0)
        setConcepts(d)
    }, [concept_list])

    console.log(data, concept_list)
    var {parsed, isValid} = validate(data);
    if (isValid) {
        // step 1
        let A = new Matrix(n, n, parsed);
        let {res: B, steps: steps1} = A.toOddMap();
        // step 2
        let {res: C, steps: steps2} = B.transitive_closure();
        // step 3
        let {res: D, steps: steps3} = C.positive_negative();
        
        // step 4
        let {res: cons, steps: steps4_1} = D.get_consonans_matrix();
        let {steps: steps4_2} = D.get_disonans_matrix();
        let {res: infl, steps: steps4_3} = D.get_influence_matrix();
    
        let cons_system_on_concept = Matrix.transpose(cons.data).map((el) => el.reduce((partialSum, a) => partialSum + a, 0)/cons.rows_count);
        let dis_system_on_concept = cons_system_on_concept.map(el => 1 -el);
        
        let cons_concept_on_system = cons.data.map((el) => el.reduce((partialSum, a) => partialSum + a, 0)/cons.rows_count);
        let dis_concept_on_system = cons_concept_on_system.map(el => 1 -el);
    
        let infl_concept_on_system = Matrix.transpose(infl.data).map((el) => el.reduce((partialSum, a) => partialSum + a, 0)/cons.rows_count);
        let infl_system_on_concept = infl.data.map((el) => el.reduce((partialSum, a) => partialSum + a, 0)/cons.rows_count);

        let rows = []
        for (let i = 0; i < Object.keys(parsed).length; i++) {
        rows.push(createData(
            Object.keys(concepts)[i],
            Number(cons_system_on_concept[i]).toFixed(2),
            Number(dis_system_on_concept[i]).toFixed(2),
            Number(cons_concept_on_system[i]).toFixed(2),
            Number(dis_concept_on_system[i]).toFixed(2),
            Number(infl_system_on_concept[i]).toFixed(2),
            Number(infl_concept_on_system[i]).toFixed(2)
        ));
        }

        // modeling
        let modeling_data = [{}];
        const keys = Object.keys(concepts);
        let is_valid = true;
        for (var k = 0; k < keys.length; k++) {
            modeling_data[0][keys[k]] = 0;
            if (concepts[keys[k]] === undefined) {
                is_valid = false
            }
        }

        if (is_valid) {
            modeling_data.push(concepts);
            let t = 1
            let breaking = false;
            let toStop = false;
            let local_limit = limit;
            let count_for_proof = 3;
            while(t < local_limit) {
                modeling_data[t+1] = {}
                console.log("iter: ", t);
                toStop = true;
                for (let i = 0; i < n; i++) {
                    modeling_data[t+1][keys[i]] = modeling_data[t][keys[i]];
                    let old = modeling_data[t][keys[i]];
                    for (let j = 0; j < n; j++) {
                        let delta = modeling_data[t][keys[j]]-modeling_data[t-1][keys[j]];
                        if (i === j) { continue; }
                        // modeling_data[t+1][keys[i]] = S_norm(modeling_data[t+1][keys[i]], T_norm(modeling_data[t][keys[j]]-modeling_data[t-1][keys[j]], A.data[j][i]));
                        // modeling_data[t+1][keys[i]] = modeling_data[t+1][keys[i]] + T_norm(modeling_data[t][keys[j]]-modeling_data[t-1][keys[j]], A.data[j][i]);
                        // modeling_data[t+1][keys[i]] = modeling_data[t+1][keys[i]] + T_norm(modeling_data[t][keys[j]]-modeling_data[t-1][keys[j]], (modeling_data[t][keys[j]]-modeling_data[t-1][keys[j]]) >= 0 ? D.data[j][i][0] : -D.data[j][i][1]);
                        modeling_data[t+1][keys[i]] = modeling_data[t+1][keys[i]] + T_norm(delta, A.data[j][i]);
                    }
                    let newValue = modeling_data[t+1][keys[i]];
                    let grow = newValue/old;
                    console.log(keys[i], grow, newValue);
                    let isInfty = !isFinite(grow) && !isNaN(grow);
                    let isGreatChange = Math.abs(1 - grow) > epsilon;
                    if (!breaking && (isInfty || isGreatChange)) {
                        console.log(grow)
                        toStop = false;
                    }
                }
                if (!breaking && toStop)
                {
                    if (count_for_proof <= 1) {
                        console.log(t, "breaking");
                        breaking = true;
                        local_limit = t + 10;
                    }
                    else {
                        count_for_proof -= 1;
                        console.log('count_for_proof -= 1', count_for_proof, t)
                    }
                }
                else {
                    count_for_proof = 3;
                }
                t++;
            }
        }
        let formated_data = modeling_data.map((row, index) => {
            let rounded = {}
            Object.keys(row).forEach(key => {
            rounded[key] = Number(row[key]).toFixed(2);
            });
            return {"name": index.toString(), ...rounded}
        })
    
        const contrast_colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#000000']  
    
        return (
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
                
                <h2>Системные показатели нечеткой когнитивной карты</h2>
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
                <Table aria-label="simple table">
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
                    {rows.map((row, index) => (
                        <TableRow
                        key={index}
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
                <h2>Прогнозирование</h2>
                <p>Введите значение импульса</p>
                <div id="prediction">
                    <ul>
                        {Object.keys(concepts).map((el, index) =>
                        <li key={index}>
                            <input
                                // variant="outlined"
                                type="number"
                                step="0.1"
                                placeholder={concepts[el]}
                                onChange={(e) => {
                            let value = e.target.value;
                            let new_value = parseFloat(value);
                            if (isNaN(new_value)) 
                            {
                                setConcepts({...concepts, [el]: 0})
                            }
                            else {
                                setConcepts({...concepts, [el]: parseFloat(value)})
                            }
                            }}/>
                            <label>{el}</label>
                        </li>
                        )}
                        <label>Продолжать пока относительное изменение для какого-то параметра больше, чем epsilon = </label>
                        <input
                            type="number"
                            placeholder={epsilon}
                            onChange={(e) => {
                                let value = e.target.value;
                                let new_value = parseFloat(value);
                                if (isNaN(new_value)) {
                                    setEpsilon(DEFAULT_EPSILON)
                                }
                                else {
                                    setEpsilon(new_value);
                                }
                            }}
                        />
                        <br />
                        <label>Но не более, чем limit операций = </label>
                        <input
                            type="number"
                            placeholder={limit}
                            onChange={(e) => {
                                let value = e.target.value;
                                let new_value = parseFloat(value);
                                if (isNaN(new_value)) {
                                    setLimit(DEFAULT_LIMIT)
                                }
                                else {
                                    setLimit(new_value);
                                }
                            }}
                        />
                    </ul>
                    {is_valid ? <LineChart width={800} height={800} data={formated_data}>
                        <XAxis dataKey="name" domain={[0, 'dataMax']}/>
                        <YAxis domain={[-5, 5]}/>
                        <Tooltip position={ {x: 800, y: 0} }/>
                        <Legend />
                        <ReferenceLine purpose='fake x axis' y={0} stroke='#666666' />
                        {keys.map((el, index) => 
                            <Line key={index} type="basic" dataKey={el} stroke={contrast_colors[index]}/>) }
                        </LineChart> : <p>Неправильный импульс</p>
                    }
                    </div>
            </div>
        )
    }
}

export default MainTable;