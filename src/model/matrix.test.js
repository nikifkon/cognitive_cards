import Matrix from './matrix';

test('Matrix constructor', () => {
    let m = new Matrix(3, 4, [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]);
    expect(m.rows_count).toBe(3)
    expect(m.columns_count).toBe(4);
    expect(m.get(2,3)).toBe(7);
})

test('toOddMap', () => {
    let m = new Matrix(2, 2, [[1, -2], [5, -6]]);
    
    let a = m.toOddMap();
    console.log(a.data)
})

test('transitive_closure', () => {
    let m = new Matrix(2, 2, [[0.9, -0.2], [0.5, -0.6]]);
    
    let a = m.transitive_closure(10);
    console.log(a.data);
    
    let b = m.transitive_closure(20);
    console.log(b.data)
})