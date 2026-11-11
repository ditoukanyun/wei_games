/** Coordinates are in the existing 640×1280 game design space. */
export interface ChapterPiece {
    id: string; name: string; asset: string; tier: number;
    width: number; height: number; x: number; y: number; flip: boolean;
    contour: number[][]; holes: number[][];
}
export const OWL_PIECES: ChapterPiece[] = [
    { name: 'body', width: 300, height: 282, x: 0, y: -80, flip: false,
        contour: [[-110,-124],[100,-124],[145,-26],[110,111],[0,137],[-110,103],[-140,-26]],
        holes: [[-65,51],[65,51],[0,-73]] },
    { name: 'wing', width: 150, height: 141, x: -145, y: -30, flip: false,
        contour: [[-44,66],[-72,28],[-50,-44],[44,-63],[67,-47],[33,22]],
        holes: [[-30,41],[-20,0],[29,-39]] },
    { name: 'wing', width: 150, height: 141, x: 145, y: -30, flip: true,
        contour: [[44,66],[72,28],[50,-44],[-44,-63],[-67,-47],[-33,22]],
        holes: [[30,41],[20,0],[-29,-39]] },
    { name: 'head', width: 325, height: 200, x: 0, y: 115, flip: false,
        contour: [[-130,85],[-155,-25],[-95,-95],[0,-85],[100,-95],[155,-25],[130,85],[0,80]],
        holes: [[0,72],[-110,-68],[110,-68]] },
].map((p,index) => ({...p,id:['body','leftWing','rightWing','face'][index],asset:`owl-${p.name}`,tier:index}));

/** Back to front. The three tiers are shared display layers, not eight hidden layers. */
export const LEVEL10_OWL_PIECES: ChapterPiece[] = [
    {id:'body',name:'body',asset:'owl-body',tier:0,width:300,height:282,x:14,y:-100,flip:false,
        contour:[[-110,-124],[100,-124],[145,-26],[110,111],[0,137],[-110,103],[-140,-26]],
        holes:[[-59,-30],[31,-30],[-14,35]]},
    {id:'leftWing',name:'wing',asset:'owl-wing',tier:1,width:150,height:141,x:-145,y:-25,flip:false,
        contour:[[-44,66],[-72,28],[-50,-44],[44,-63],[67,-47],[33,22]],
        holes:[[-36,28],[-17,-7],[24,-38]]},
    {id:'rightWing',name:'wing',asset:'owl-wing',tier:1,width:150,height:141,x:145,y:-25,flip:true,
        contour:[[44,66],[72,28],[50,-44],[-44,-63],[-67,-47],[-33,22]],
        holes:[[36,28],[17,-7],[-24,-38]]},
    {id:'breast',name:'breast',asset:'owl10-breast',tier:1,width:184,height:224,x:0,y:-90,flip:false,
        contour:[[-9,111],[-62,92],[-87,44],[-88,-37],[-62,-90],[0,-111],[62,-90],[88,-37],[87,44],[62,92]],
        holes:[[-49,22],[49,22],[0,-76]]},
    {id:'face',name:'face',asset:'owl10-face',tier:1,width:325,height:200,x:0,y:100,flip:false,
        contour:[[-130,85],[-155,-25],[-95,-95],[0,-85],[100,-95],[155,-25],[130,85],[0,80]],
        holes:[[0,60],[-90,-62],[90,-62]]},
    {id:'leftFeather',name:'feather',asset:'owl10-feather',tier:2,width:140,height:103,x:-165,y:-73,flip:false,
        contour:[[-68,33],[-55,50],[-30,50],[0,33],[43,-3],[68,-44],[15,-50],[-27,-40],[-55,-16],[-68,9]],
        holes:[[-38,19],[-32,-12],[9,-28]]},
    {id:'rightFeather',name:'feather',asset:'owl10-feather',tier:2,width:140,height:103,x:165,y:-73,flip:true,
        contour:[[68,33],[55,50],[30,50],[0,33],[-43,-3],[-68,-44],[-15,-50],[27,-40],[55,-16],[68,9]],
        holes:[[38,19],[32,-12],[-9,-28]]},
    {id:'crown',name:'crown',asset:'owl10-crown',tier:2,width:325,height:105,x:0,y:152,flip:false,
        contour:[[-161,25],[-145,50],[-75,25],[0,50],[75,25],[145,50],[161,25],[145,12],[88,-14],[30,-31],[0,-50],[-30,-31],[-88,-14],[-145,12]],
        holes:[[-70,3],[70,3],[0,15]]},
];

export function chapterPieces(level: number): readonly ChapterPiece[] {
    return level === 1 ? LEVEL10_OWL_PIECES : OWL_PIECES;
}

/** Runtime initialization visits outer, middle, then back tiers. */
export function level10ColorPlan<T>(colors: readonly T[]): { pins: T[]; targets: T[] } {
    if (colors.length !== 8) throw new Error('Level ten requires eight color triples');
    const order = [0,1,2,0,1,2,0,1,2,3,4,5,4,5,6,5,6,3,6,3,4,7,7,7];
    return { pins: order.map(index => colors[index]), targets: colors.slice() };
}

export function isChapter(level: number): boolean { return level === 1 || (level > 0 && level % 10 === 0); }
