import { useState } from 'react';

function InputMatrix({data, setIJ, concepts}) {
    // todo warning if not a number
    let [selected, setSelected] = useState();

    function onTestClick(event) {
        event.preventDefault();
        console.log(event)
        document.querySelector('#main-form').reportValidity();
    }
    let current = "<не выбрано>"
    if (selected != undefined) {
        current = `${concepts[selected[0]]} → ${concepts[selected[1]]}`;
    }
    
    return (
        <form id="main-form">
        <h3>Текущая связь {current}</h3>
        <table>
            <tbody>
                {
                    data.map((row, index) => {
                        return (
                            <tr key={index}>
                                {row.map((scalar, jndex) => {
                                    return <td key={jndex}>
                                        <input onSelect={event => {
                                            setSelected([index, jndex])
                                        }} required type="number" max="1" min="-1" step="0.01" value={scalar} onChange={e => setIJ(index, jndex, e.target.value)}/>
                                    </td>
                                })}
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
        <button onClick={onTestClick}>Проверить корректность</button>
        </form>
    );
}

export default InputMatrix;