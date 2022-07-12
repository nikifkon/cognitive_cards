 
function Steps({name, katex}) {
    return (
        <form id="main-form">
        <table>
            <tbody>
                {
                    data.map((row, index) => {
                        return (
                            <tr key={index}>
                                {row.map((scalar, jndex) => {
                                    return <td key={jndex}>
                                        <input required type="number" max="1" min="-1" step="0.01" value={scalar} onChange={e => setIJ(index, jndex, e.target.value)}/>
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

export default Steps;