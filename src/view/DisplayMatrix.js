 
function DisplayMatrix({name, data, format}) {
    if (data === undefined) {
        return (
            'Здесь будет таблица'
        )
    }
    if (!format) {
        format = (el) => Number((el).toFixed(2)).toString();
    }
    return (
        <div>
            <h4>{name}</h4>
            <table>
                <tbody>
                    {
                        data.map((row, index) => {
                            return (
                                <tr key={index}>
                                    {row.map((scalar, jndex) => {
                                        return <td key={jndex}>
                                            {format(scalar)}
                                        </td>
                                    })}
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>
    );
}

export default DisplayMatrix;