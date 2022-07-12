// стр. 21
// может быть другой
function T_norm(a, b) {
    // [0, 1]×[0, 1] → [0, 1]
    // return Math.min(a, b);
    return a*b;
    // return 1-Math.min(1, Math.sqrt((1-a)**2 + (1-b)**2));
}

function S_norm(a, b) {
    // [0, 1]×[0, 1] → [0, 1]
    return Math.max(a, b);
    // return a + b - a*b;
    // return Math.min(1, Math.sqrt(a**2 + b**2))
}

export {T_norm, S_norm};