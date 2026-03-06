# PCB API 重点整理（LCEDA Pro）

- 生成时间: 2026-03-05T06:58:56.674Z
- 官方总览: https://prodocs.lceda.cn/cn/api/reference/pro-api.html

## PCB Classes

### [IPCB_ComplexPolygon](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_complexpolygon.html)

- `addSource(complexPolygon: TPCB_PolygonSourceArray | Array<TPCB_PolygonSourceArray> | IPCB_Polygon | Array<IPCB_Polygon>): IPCB_ComplexPolygon;`
- `getSource(): TPCB_PolygonSourceArray | Array<TPCB_PolygonSourceArray>;`
- `getSourceStrictComplex(): Array<TPCB_PolygonSourceArray>;`

### [IPCB_Polygon](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_polygon.html)

- `getSource(): TPCB_PolygonSourceArray;`

### [IPCB_PrimitiveArc](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivearc.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_Net(): string;`
- `getState_Layer(): TPCB_LayersOfLine;`
- `getState_StartX(): number;`
- `getState_StartY(): number;`
- `getState_EndX(): number;`
- `getState_EndY(): number;`
- `getState_ArcAngle(): number;`
- `getState_LineWidth(): number;`
- `getState_InteractiveMode(): EPCB_PrimitiveArcInteractiveMode;`
- `getState_PrimitiveLock(): boolean;`
- `setState_Net(net: string): IPCB_PrimitiveArc;`
- `setState_Layer(layer: TPCB_LayersOfLine): IPCB_PrimitiveArc;`
- `setState_StartX(startX: number): IPCB_PrimitiveArc;`
- `setState_StartY(startY: number): IPCB_PrimitiveArc;`
- `setState_EndX(endX: number): IPCB_PrimitiveArc;`
- `setState_EndY(endY: number): IPCB_PrimitiveArc;`
- `setState_ArcAngle(arcAngle: number): IPCB_PrimitiveArc;`
- `setState_LineWidth(lineWidth: number): IPCB_PrimitiveArc;`
- `setState_InteractiveMode(interactiveMode: EPCB_PrimitiveArcInteractiveMode): IPCB_PrimitiveArc;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveArc;`
- `toAsync(): IPCB_PrimitiveArc;`
- `toSync(): IPCB_PrimitiveArc;`
- `isAsync(): boolean;`
- `reset(): Promise<IPCB_PrimitiveArc>;`
- `done(): Promise<IPCB_PrimitiveArc>;`
- `getAdjacentPrimitives(): Promise<Array<IPCB_PrimitiveLine | IPCB_PrimitiveVia | IPCB_PrimitiveArc>>;`
- `getEntireTrack(includeVias: false): Promise<Array<IPCB_PrimitiveLine | IPCB_PrimitiveArc>>;`
- `getEntireTrack(includeVias: true): Promise<Array<IPCB_PrimitiveLine | IPCB_PrimitiveArc | IPCB_PrimitiveVia>>;`

### [IPCB_PrimitiveAttribute](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitiveattribute.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_ParentPrimitiveId(): string;`
- `getState_Layer(): TPCB_LayersOfImage;`
- `getState_X(): number | null;`
- `getState_Y(): number | null;`
- `getState_Key(): string;`
- `getState_Value(): string;`
- `getState_KeyVisible(): boolean;`
- `getState_ValueVisible(): boolean;`
- `getState_FontFamily(): string;`
- `getState_FontSize(): number;`
- `getState_LineWidth(): number;`
- `getState_AlignMode(): EPCB_PrimitiveStringAlignMode;`
- `getState_Rotation(): number;`
- `getState_Reverse(): boolean;`
- `getState_Expansion(): number;`
- `getState_Mirror(): boolean;`
- `getState_PrimitiveLock(): boolean;`
- `setState_Layer(layer: TPCB_LayersOfImage): IPCB_PrimitiveAttribute;`
- `setState_X(x: number): IPCB_PrimitiveAttribute;`
- `setState_Y(y: number): IPCB_PrimitiveAttribute;`
- `setState_Key(key: string): IPCB_PrimitiveAttribute;`
- `setState_Value(value: string): IPCB_PrimitiveAttribute;`
- `setState_KeyVisible(keyVisible: boolean): IPCB_PrimitiveAttribute;`
- `setState_ValueVisible(valueVisible: boolean): IPCB_PrimitiveAttribute;`
- `setState_FontFamily(fontFamily: string): IPCB_PrimitiveAttribute;`
- `setState_FontSize(fontSize: number): IPCB_PrimitiveAttribute;`
- `setState_LineWidth(lineWidth: number): IPCB_PrimitiveAttribute;`
- `setState_AlignMode(alignMode: EPCB_PrimitiveStringAlignMode): IPCB_PrimitiveAttribute;`
- `setState_Rotation(rotation: number): IPCB_PrimitiveAttribute;`
- `setState_Reverse(reverse: boolean): IPCB_PrimitiveAttribute;`
- `setState_Expansion(expansion: number): IPCB_PrimitiveAttribute;`
- `setState_Mirror(mirror: boolean): IPCB_PrimitiveAttribute;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveAttribute;`
- `toAsync(): IPCB_PrimitiveAttribute;`
- `toSync(): IPCB_PrimitiveAttribute;`
- `isAsync(): boolean;`

### [IPCB_PrimitiveComponent](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivecomponent.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_Layer(): TPCB_LayersOfComponent;`
- `getState_X(): number;`
- `getState_Y(): number;`
- `getState_Rotation(): number;`
- `getState_PrimitiveLock(): boolean;`
- `getState_AddIntoBom(): boolean;`
- `getState_Designator(): string | undefined;`
- `getState_Name(): string | undefined;`
- `getState_UniqueId(): string | undefined;`
- `getState_Manufacturer(): string | undefined;`
- `getState_ManufacturerId(): string | undefined;`
- `getState_Supplier(): string | undefined;`
- `getState_SupplierId(): string | undefined;`
- `setState_Layer(layer: TPCB_LayersOfComponent): IPCB_PrimitiveComponent;`
- `setState_X(x: number): IPCB_PrimitiveComponent;`
- `setState_Y(y: number): IPCB_PrimitiveComponent;`
- `setState_Rotation(rotation: number): IPCB_PrimitiveComponent;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveComponent;`
- `setState_AddIntoBom(addIntoBom: boolean): IPCB_PrimitiveComponent;`
- `setState_Designator(designator: string | undefined): IPCB_PrimitiveComponent;`
- `setState_Name(name: string | undefined): IPCB_PrimitiveComponent;`
- `setState_UniqueId(uniqueId: string | undefined): IPCB_PrimitiveComponent;`
- `setState_Manufacturer(manufacturer: string | undefined): IPCB_PrimitiveComponent;`
- `setState_ManufacturerId(manufacturerId: string | undefined): IPCB_PrimitiveComponent;`
- `setState_Supplier(supplier: string | undefined): IPCB_PrimitiveComponent;`
- `setState_SupplierId(supplierId: string | undefined): IPCB_PrimitiveComponent;`
- `toAsync(): IPCB_PrimitiveComponent;`
- `toSync(): IPCB_PrimitiveComponent;`
- `isAsync(): boolean;`
- `reset(): Promise<IPCB_PrimitiveComponent>;`
- `done(): Promise<IPCB_PrimitiveComponent>;`
- `getAllPins(): Promise<Array<IPCB_PrimitiveComponentPad>>;`

### [IPCB_PrimitiveComponentPad](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivecomponentpad.html)

- `done(): Promise<IPCB_PrimitiveComponentPad>;`
- `getConnectedPrimitives(onlyCentreConnection: false): Promise<Array<IPCB_PrimitiveLine | IPCB_PrimitiveArc | IPCB_PrimitiveVia | IPCB_PrimitivePolyline | IPCB_PrimitiveFill>>;`

### [IPCB_PrimitiveDimension](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivedimension.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_DimensionType(): EPCB_PrimitiveDimensionType;`
- `getState_CoordinateSet(): TPCB_PrimitiveDimensionCoordinateSet;`
- `getState_Layer(): TPCB_LayersOfDimension;`
- `getState_Unit(): ESYS_Unit.MILLIMETER | ESYS_Unit.CENTIMETER | ESYS_Unit.INCH | ESYS_Unit.MIL;`
- `getState_LineWidth(): number;`
- `getState_Precision(): number;`
- `getState_TextFollow(): 0 | 1;`
- `getState_PrimitiveLock(): boolean;`
- `setState_DimensionType(dimensionType: EPCB_PrimitiveDimensionType): IPCB_PrimitiveDimension;`
- `setState_CoordinateSet(coordinateSet: TPCB_PrimitiveDimensionCoordinateSet): IPCB_PrimitiveDimension;`
- `setState_Layer(layer: TPCB_LayersOfDimension): IPCB_PrimitiveDimension;`
- `setState_Unit(unit: ESYS_Unit.MILLIMETER | ESYS_Unit.CENTIMETER | ESYS_Unit.INCH | ESYS_Unit.MIL): IPCB_PrimitiveDimension;`
- `setState_LineWidth(lineWidth: number): IPCB_PrimitiveDimension;`
- `setState_Precision(precision: number): IPCB_PrimitiveDimension;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveDimension;`
- `toAsync(): IPCB_PrimitiveDimension;`
- `toSync(): IPCB_PrimitiveDimension;`
- `isAsync(): boolean;`
- `reset(): Promise<IPCB_PrimitiveDimension>;`
- `done(): Promise<IPCB_PrimitiveDimension>;`

### [IPCB_PrimitiveFill](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivefill.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_Net(): string | undefined;`
- `getState_Layer(): TPCB_LayersOfFill;`
- `getState_ComplexPolygon(): IPCB_Polygon;`
- `getState_FillMode(): EPCB_PrimitiveFillMode | undefined;`
- `getState_LineWidth(): number;`
- `getState_PrimitiveLock(): boolean;`
- `setState_Layer(layer: TPCB_LayersOfFill): IPCB_PrimitiveFill;`
- `setState_ComplexPolygon(complexPolygon: IPCB_Polygon): IPCB_PrimitiveFill;`
- `setState_Net(net: string): IPCB_PrimitiveFill;`
- `setState_FillMode(fillMode: EPCB_PrimitiveFillMode): IPCB_PrimitiveFill;`
- `setState_LineWidth(lineWidth: number): IPCB_PrimitiveFill;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveFill;`
- `toAsync(): IPCB_PrimitiveFill;`
- `toSync(): IPCB_PrimitiveFill;`
- `isAsync(): boolean;`
- `reset(): Promise<IPCB_PrimitiveFill>;`
- `done(): Promise<IPCB_PrimitiveFill>;`
- `convertToPolyline(): Promise<IPCB_PrimitivePolyline>;`
- `convertToPour(): Promise<IPCB_PrimitivePour>;`
- `convertToRegion(): Promise<IPCB_PrimitiveRegion>;`

### [IPCB_PrimitiveImage](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitiveimage.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_X(): number;`
- `getState_Y(): number;`
- `getState_ComplexPolygon(): TPCB_PolygonSourceArray | Array<TPCB_PolygonSourceArray>;`
- `getState_Layer(): TPCB_LayersOfImage;`
- `getState_Width(): number;`
- `getState_Height(): number;`
- `getState_Rotation(): number;`
- `getState_HorizonMirror(): boolean;`
- `getState_PrimitiveLock(): boolean;`
- `setState_X(x: number): IPCB_PrimitiveImage;`
- `setState_Y(y: number): IPCB_PrimitiveImage;`
- `setState_Layer(layer: TPCB_LayersOfImage): IPCB_PrimitiveImage;`
- `setState_Width(width: number): IPCB_PrimitiveImage;`
- `setState_Height(height: number): IPCB_PrimitiveImage;`
- `setState_Rotation(rotation: number): IPCB_PrimitiveImage;`
- `setState_HorizonMirror(horizonMirror: boolean): IPCB_PrimitiveImage;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveImage;`
- `toAsync(): IPCB_PrimitiveImage;`
- `toSync(): IPCB_PrimitiveImage;`
- `isAsync(): boolean;`
- `reset(): Promise<IPCB_PrimitiveImage>;`
- `done(): Promise<IPCB_PrimitiveImage>;`

### [IPCB_PrimitiveLine](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitiveline.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_Net(): string;`
- `getState_Layer(): TPCB_LayersOfLine;`
- `getState_StartX(): number;`
- `getState_StartY(): number;`
- `getState_EndX(): number;`
- `getState_EndY(): number;`
- `getState_LineWidth(): number;`
- `getState_PrimitiveLock(): boolean;`
- `setState_Net(net: string): IPCB_PrimitiveLine;`
- `setState_Layer(layer: TPCB_LayersOfLine): IPCB_PrimitiveLine;`
- `setState_StartX(startX: number): IPCB_PrimitiveLine;`
- `setState_StartY(startY: number): IPCB_PrimitiveLine;`
- `setState_EndX(endX: number): IPCB_PrimitiveLine;`
- `setState_EndY(endY: number): IPCB_PrimitiveLine;`
- `setState_LineWidth(lineWidth: number): IPCB_PrimitiveLine;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveLine;`
- `toAsync(): IPCB_PrimitiveLine;`
- `toSync(): IPCB_PrimitiveLine;`
- `isAsync(): boolean;`
- `reset(): Promise<IPCB_PrimitiveLine>;`
- `done(): Promise<IPCB_PrimitiveLine>;`
- `getAdjacentPrimitives(): Promise<Array<IPCB_PrimitiveLine | IPCB_PrimitiveVia | IPCB_PrimitiveArc>>;`
- `getEntireTrack(includeVias: false): Promise<Array<IPCB_PrimitiveLine | IPCB_PrimitiveArc>>;`
- `getEntireTrack(includeVias: true): Promise<Array<IPCB_PrimitiveLine | IPCB_PrimitiveArc | IPCB_PrimitiveVia>>;`

### [IPCB_PrimitiveObject](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitiveobject.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_Layer(): TPCB_LayersOfObject | undefined;`
- `getState_TopLeftX(): number | undefined;`
- `getState_TopLeftY(): number | undefined;`
- `getState_BinaryData(): string;`
- `getState_Width(): number;`
- `getState_Height(): number;`
- `getState_Rotation(): number;`
- `getState_Mirror(): boolean;`
- `getState_FileName(): string;`
- `getState_PrimitiveLock(): boolean;`
- `setState_Layer(layer: TPCB_LayersOfObject): IPCB_PrimitiveObject;`
- `setState_TopLeftX(topLeftX: number): IPCB_PrimitiveObject;`
- `setState_TopLeftY(topLeftY: number): IPCB_PrimitiveObject;`
- `setState_BinaryData(binaryData: string): IPCB_PrimitiveObject;`
- `setState_Width(width: number): IPCB_PrimitiveObject;`
- `setState_Height(height: number): IPCB_PrimitiveObject;`
- `setState_Rotation(rotation: number): IPCB_PrimitiveObject;`
- `setState_Mirror(mirror: boolean): IPCB_PrimitiveObject;`
- `setState_FileName(fileName: string): IPCB_PrimitiveObject;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveObject;`
- `toAsync(): IPCB_PrimitiveObject;`
- `toSync(): IPCB_PrimitiveObject;`
- `isAsync(): boolean;`
- `reset(): Promise<IPCB_PrimitiveObject>;`
- `done(): Promise<IPCB_PrimitiveObject>;`

### [IPCB_PrimitivePad](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivepad.html)

- `create(): Promise<IPCB_PrimitivePad>;`
- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_Layer(): TPCB_LayersOfPad;`
- `getState_PadNumber(): string;`
- `getState_X(): number;`
- `getState_Y(): number;`
- `getState_Rotation(): number;`
- `getState_Pad(): TPCB_PrimitivePadShape | undefined;`
- `getState_Net(): string | undefined;`
- `getState_Hole(): TPCB_PrimitivePadHole | null;`
- `getState_HoleOffsetX(): number;`
- `getState_HoleOffsetY(): number;`
- `getState_HoleRotation(): number;`
- `getState_Metallization(): boolean;`
- `getState_PadType(): EPCB_PrimitivePadType;`
- `getState_SpecialPad(): TPCB_PrimitiveSpecialPadShape | undefined;`
- `getState_SolderMaskAndPasteMaskExpansion(): IPCB_PrimitiveSolderMaskAndPasteMaskExpansion | null;`
- `getState_HeatWelding(): IPCB_PrimitivePadHeatWelding | null;`
- `getState_PrimitiveLock(): boolean;`
- `setState_Layer(layer: TPCB_LayersOfPad): IPCB_PrimitivePad;`
- `setState_PadNumber(padNumber: string): IPCB_PrimitivePad;`
- `setState_X(x: number): IPCB_PrimitivePad;`
- `setState_Y(y: number): IPCB_PrimitivePad;`
- `setState_Rotation(rotation: number): IPCB_PrimitivePad;`
- `setState_Pad(pad: TPCB_PrimitivePadShape): IPCB_PrimitivePad;`
- `setState_Net(net?: string): IPCB_PrimitivePad;`
- `setState_Hole(hole: TPCB_PrimitivePadHole): IPCB_PrimitivePad;`
- `setState_HoleOffsetX(holeOffsetX: number): IPCB_PrimitivePad;`
- `setState_HoleOffsetY(holeOffsetY: number): IPCB_PrimitivePad;`
- `setState_HoleRotation(holeRotation: number): IPCB_PrimitivePad;`
- `setState_Metallization(metallization: boolean): IPCB_PrimitivePad;`
- `setState_SpecialPad(specialPad: TPCB_PrimitiveSpecialPadShape): IPCB_PrimitivePad;`
- `setState_SolderMaskAndPasteMaskExpansion(solderMaskAndPasteMaskExpansion: IPCB_PrimitiveSolderMaskAndPasteMaskExpansion | null): IPCB_PrimitivePad;`
- `setState_HeatWelding(heatWelding: IPCB_PrimitivePadHeatWelding | null): IPCB_PrimitivePad;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitivePad;`
- `toAsync(): IPCB_PrimitivePad;`
- `toSync(): IPCB_PrimitivePad;`
- `isAsync(): boolean;`
- `reset(): Promise<IPCB_PrimitivePad>;`
- `done(): Promise<IPCB_PrimitivePad>;`

### [IPCB_PrimitivePolyline](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivepolyline.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_Net(): string;`
- `getState_Layer(): TPCB_LayersOfLine;`
- `getState_Polygon(): IPCB_Polygon;`
- `getState_LineWidth(): number;`
- `getState_PrimitiveLock(): boolean;`
- `setState_Net(net: string): IPCB_PrimitivePolyline;`
- `setState_Layer(layer: TPCB_LayersOfLine): IPCB_PrimitivePolyline;`
- `setState_Polygon(polygon: IPCB_Polygon): IPCB_PrimitivePolyline;`
- `setState_LineWidth(lineWidth: number): IPCB_PrimitivePolyline;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitivePolyline;`
- `toAsync(): IPCB_PrimitivePolyline;`
- `toSync(): IPCB_PrimitivePolyline;`
- `isAsync(): boolean;`
- `reset(): Promise<IPCB_PrimitivePolyline>;`
- `done(): Promise<IPCB_PrimitivePolyline>;`
- `convertToFill(): Promise<IPCB_PrimitiveFill>;`
- `convertToPour(): Promise<IPCB_PrimitivePour>;`
- `convertToRegion(): Promise<IPCB_PrimitiveRegion>;`

### [IPCB_PrimitivePour](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivepour.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_Net(): string;`
- `getState_Layer(): TPCB_LayersOfCopper;`
- `getState_ComplexPolygon(): IPCB_Polygon;`
- `getState_PourFillMethod(): any;`
- `getState_PreserveSilos(): boolean;`
- `getState_PourName(): string;`
- `getState_PourPriority(): number;`
- `getState_LineWidth(): number;`
- `getState_PrimitiveLock(): boolean;`
- `setState_Net(net: string): IPCB_PrimitivePour;`
- `setState_Layer(layer: TPCB_LayersOfCopper): IPCB_PrimitivePour;`
- `setState_ComplexPolygon(complexPolygon: IPCB_Polygon): IPCB_PrimitivePour;`
- `setState_PourFillMethod(pourFillMethod: EPCB_PrimitivePourFillMethod): IPCB_PrimitivePour;`
- `setState_PreserveSilos(preserveSilos: boolean): IPCB_PrimitivePour;`
- `setState_PourName(pourName: string): IPCB_PrimitivePour;`
- `setState_PourPriority(pourPriority: number): IPCB_PrimitivePour;`
- `setState_LineWidth(lineWidth: number): IPCB_PrimitivePour;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitivePour;`
- `toAsync(): IPCB_PrimitivePour;`
- `toSync(): IPCB_PrimitivePour;`
- `isAsync(): boolean;`
- `reset(): Promise<IPCB_PrimitivePour>;`
- `done(): Promise<IPCB_PrimitivePour>;`
- `convertToFill(): Promise<IPCB_PrimitiveFill>;`
- `convertToPolyline(): Promise<IPCB_PrimitivePolyline>;`
- `convertToRegion(): Promise<IPCB_PrimitiveRegion>;`

### [IPCB_PrimitivePoured](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivepoured.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_PourPrimitiveId(): string;`
- `getState_PourFills(): Array<IPCB_PrimitivePouredPourFill>;`

### [IPCB_PrimitiveRegion](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitiveregion.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_Layer(): TPCB_LayersOfRegion;`
- `getState_ComplexPolygon(): IPCB_Polygon;`
- `getState_RuleType(): Array<EPCB_PrimitiveRegionRuleType>;`
- `getState_RegionName(): string | undefined;`
- `getState_LineWidth(): number;`
- `getState_PrimitiveLock(): boolean;`
- `setState_Layer(layer: TPCB_LayersOfRegion): IPCB_PrimitiveRegion;`
- `setState_ComplexPolygon(complexPolygon: IPCB_Polygon): IPCB_PrimitiveRegion;`
- `setState_RuleType(ruleType: Array<EPCB_PrimitiveRegionRuleType>): IPCB_PrimitiveRegion;`
- `setState_RegionName(regionName?: string): IPCB_PrimitiveRegion;`
- `setState_LineWidth(lineWidth: number): IPCB_PrimitiveRegion;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveRegion;`
- `toAsync(): IPCB_PrimitiveRegion;`
- `toSync(): IPCB_PrimitiveRegion;`
- `isAsync(): boolean;`
- `reset(): Promise<IPCB_PrimitiveRegion>;`
- `done(): Promise<IPCB_PrimitiveRegion>;`
- `convertToFill(): Promise<IPCB_PrimitiveFill>;`
- `convertToPolyline(): Promise<IPCB_PrimitivePolyline>;`
- `convertToPour(): Promise<IPCB_PrimitivePour>;`

### [IPCB_PrimitiveString](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivestring.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_Layer(): TPCB_LayersOfImage;`
- `getState_X(): number;`
- `getState_Y(): number;`
- `getState_Text(): string;`
- `getState_FontFamily(): string;`
- `getState_FontSize(): number;`
- `getState_LineWidth(): number;`
- `getState_AlignMode(): EPCB_PrimitiveStringAlignMode;`
- `getState_Rotation(): number;`
- `getState_Reverse(): boolean;`
- `getState_Expansion(): number;`
- `getState_Mirror(): boolean;`
- `getState_PrimitiveLock(): boolean;`
- `setState_Layer(layer: TPCB_LayersOfImage): IPCB_PrimitiveString;`
- `setState_X(x: number): IPCB_PrimitiveString;`
- `setState_Y(y: number): IPCB_PrimitiveString;`
- `setState_Text(text: string): IPCB_PrimitiveString;`
- `setState_FontFamily(fontFamily: string): IPCB_PrimitiveString;`
- `setState_FontSize(fontSize: number): IPCB_PrimitiveString;`
- `setState_LineWidth(lineWidth: number): IPCB_PrimitiveString;`
- `setState_AlignMode(alignMode: EPCB_PrimitiveStringAlignMode): IPCB_PrimitiveString;`
- `setState_Rotation(rotation: number): IPCB_PrimitiveString;`
- `setState_Reverse(reverse: boolean): IPCB_PrimitiveString;`
- `setState_Expansion(expansion: number): IPCB_PrimitiveString;`
- `setState_Mirror(mirror: boolean): IPCB_PrimitiveString;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveString;`
- `toAsync(): IPCB_PrimitiveString;`
- `toSync(): IPCB_PrimitiveString;`
- `isAsync(): boolean;`

### [IPCB_PrimitiveVia](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivevia.html)

- `getState_PrimitiveType(): EPCB_PrimitiveType;`
- `getState_PrimitiveId(): string;`
- `getState_Net(): string;`
- `getState_X(): number;`
- `getState_Y(): number;`
- `getState_HoleDiameter(): number;`
- `getState_Diameter(): number;`
- `getState_ViaType(): EPCB_PrimitiveViaType;`
- `getState_DesignRuleBlindViaName(): string | null;`
- `getState_SolderMaskExpansion(): IPCB_PrimitiveSolderMaskAndPasteMaskExpansion | null;`
- `getState_PrimitiveLock(): boolean;`
- `setState_Net(net: string): IPCB_PrimitiveVia;`
- `setState_X(x: number): IPCB_PrimitiveVia;`
- `setState_Y(y: number): IPCB_PrimitiveVia;`
- `setState_HoleDiameter(holeDiameter: number): IPCB_PrimitiveVia;`
- `setState_Diameter(diameter: number): IPCB_PrimitiveVia;`
- `setState_ViaType(viaType: EPCB_PrimitiveViaType): IPCB_PrimitiveVia;`
- `setState_DesignRuleBlindViaName(designRuleBlindViaName: string | null): IPCB_PrimitiveVia;`
- `setState_SolderMaskExpansion(solderMaskExpansion: IPCB_PrimitiveSolderMaskAndPasteMaskExpansion | null): IPCB_PrimitiveVia;`
- `setState_PrimitiveLock(primitiveLock: boolean): IPCB_PrimitiveVia;`
- `toAsync(): IPCB_PrimitiveVia;`
- `toSync(): IPCB_PrimitiveVia;`
- `isAsync(): boolean;`
- `reset(): Promise<IPCB_PrimitiveVia>;`
- `done(): Promise<IPCB_PrimitiveVia>;`
- `getAdjacentPrimitives(): Promise<Array<IPCB_PrimitiveLine | IPCB_PrimitiveArc>>;`

### [PCB_Document](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_document.html)

- `importChanges(uuid?: string): Promise<boolean>;`
- `importAutoRouteJsonFile(autoRouteFile: File): Promise<boolean>;`
- `importAutoLayoutJsonFile(autoLayoutFile: File): Promise<boolean>;`
- `save(uuid: string): Promise<boolean>;`
- `getCalculatingRatlineStatus(): Promise<EPCB_DocumentRatlineCalculatingActiveStatus>;`
- `startCalculatingRatline(): Promise<boolean>;`
- `stopCalculatingRatline(): Promise<boolean>;`
- `setCanvasOrigin(offsetX: number, offsetY: number): Promise<boolean>;`
- `navigateToCoordinates(x: number, y: number): Promise<boolean>;`
- `navigateToRegion(left: number, right: number, top: number, bottom: number): Promise<boolean>;`
- `getPrimitiveAtPoint(x: number, y: number): Promise<IPCB_Primitive | undefined>;`
- `getPrimitivesInRegion(left: number, right: number, top: number, bottom: number, leftToRight?: boolean): Promise<Array<IPCB_Primitive>>;`
- `zoomToBoardOutline(): Promise<boolean>;`

### [PCB_Drc](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_drc.html)

- `check(strict: boolean, userInterface: boolean, includeVerboseError: false): Promise<boolean>;`
- `check(strict: boolean, userInterface: boolean, includeVerboseError: true): Promise<Array<any>>;`
- `getCurrentRuleConfigurationName(): Promise<string | undefined>;`
- `renameRuleConfiguration(originalConfigurationName: string, configurationName: string): Promise<boolean>;`
- `deleteRuleConfiguration(configurationName: string): Promise<boolean>;`
- `getDefaultRuleConfigurationName(): Promise<string | undefined>;`
- `setAsDefaultRuleConfiguration(configurationName: string): Promise<boolean>;`
- `createNetClass(netClassName: string, nets: Array<string>, color: IPCB_EqualLengthNetGroupItem['color']): Promise<boolean>;`
- `deleteNetClass(netClassName: string): Promise<boolean>;`
- `modifyNetClassName(originalNetClassName: string, netClassName: string): Promise<boolean>;`
- `addNetToNetClass(netClassName: string, net: string | Array<string>): Promise<boolean>;`
- `removeNetFromNetClass(netClassName: string, net: string | Array<string>): Promise<boolean>;`
- `getAllNetClasses(): Promise<Array<IPCB_NetClassItem>>;`
- `createDifferentialPair(differentialPairName: string, positiveNet: string, negativeNet: string): Promise<boolean>;`
- `deleteDifferentialPair(differentialPairName: string): Promise<boolean>;`
- `modifyDifferentialPairName(originalDifferentialPairName: string, differentialPairName: string): Promise<boolean>;`
- `modifyDifferentialPairPositiveNet(differentialPairName: string, positiveNet: string): Promise<boolean>;`
- `modifyDifferentialPairNegativeNet(differentialPairName: string, negativeNet: string): Promise<boolean>;`
- `getAllDifferentialPairs(): Promise<Array<IPCB_DifferentialPairItem>>;`
- `createEqualLengthNetGroup(equalLengthNetGroupName: string, nets: Array<string>, color: IPCB_EqualLengthNetGroupItem['color']): Promise<boolean>;`
- `deleteEqualLengthNetGroup(equalLengthNetGroupName: string): Promise<boolean>;`
- `modifyEqualLengthNetGroupName(originalEqualLengthNetGroupName: string, equalLengthNetGroupName: string): Promise<boolean>;`
- `addNetToEqualLengthNetGroup(equalLengthNetGroupName: string, net: string | Array<string>): Promise<boolean>;`
- `removeNetFromEqualLengthNetGroup(equalLengthNetGroupName: string, net: string | Array<string>): Promise<boolean>;`
- `getAllEqualLengthNetGroups(): Promise<Array<IPCB_EqualLengthNetGroupItem>>;`
- `createPadPairGroup(padPairGroupName: string, padPairs: Array<[string, string]>): Promise<boolean>;`
- `deletePadPairGroup(padPairGroupName: string): Promise<boolean>;`
- `modifyPadPairGroupName(originalPadPairGroupName: string, padPairGroupName: string): Promise<boolean>;`
- `addPadPairToPadPairGroup(padPairGroupName: string, padPair: [string, string] | Array<[string, string]>): Promise<boolean>;`
- `removePadPairFromPadPairGroup(padPairGroupName: string, padPair: [string, string] | Array<[string, string]>): Promise<boolean>;`
- `getAllPadPairGroups(): Promise<Array<IPCB_PadPairGroupItem>>;`
- `getPadPairGroupMinWireLength(padPairGroupName: string): Promise<Array<IPCB_PadPairMinWireLengthItem>>;`

### [PCB_Event](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_event.html)

- `addMouseEventListener(id: string, eventType: 'all' | EPCB_MouseEventType, callFn: (eventType: EPCB_MouseEventType) => void | Promise<void>, onlyOnce?: boolean): void;`
- `removeEventListener(id: string): boolean;`
- `isEventListenerAlreadyExist(id: string): boolean;`

### [PCB_Layer](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_layer.html)

- `selectLayer(layer: TPCB_LayersInTheSelectable): Promise<boolean>;`
- `setLayerVisible(layer?: TPCB_LayersInTheSelectable | Array<TPCB_LayersInTheSelectable>, setOtherLayerInvisible?: boolean): Promise<boolean>;`
- `setLayerInvisible(layer?: TPCB_LayersInTheSelectable | Array<TPCB_LayersInTheSelectable>, setOtherLayerVisible?: boolean): Promise<boolean>;`
- `lockLayer(layer?: TPCB_LayersInTheSelectable | Array<TPCB_LayersInTheSelectable>): Promise<boolean>;`
- `unlockLayer(layer?: TPCB_LayersInTheSelectable | Array<TPCB_LayersInTheSelectable>): Promise<boolean>;`
- `setTheNumberOfCopperLayers(numberOfLayers: 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30 | 32): Promise<boolean>;`
- `setLayerColorConfiguration(colorConfiguration: EPCB_LayerColorConfiguration): Promise<boolean>;`
- `setInactiveLayerTransparency(transparency: number): Promise<boolean>;`
- `setPcbType(pcbType: EPCB_PcbPlateType): Promise<boolean>;`
- `addCustomLayer(): Promise<TPCB_LayersOfCustom | undefined>;`
- `removeLayer(layer: TPCB_LayersOfCustom): Promise<boolean>;`
- `getAllLayers(): Promise<Array<IPCB_LayerItem>>;`
- `setInactiveLayerDisplayMode(displayMode?: EPCB_InactiveLayerDisplayMode): Promise<boolean>;`

### [PCB_ManufactureData](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_manufacturedata.html)

- `get3DFile(fileName?: string, fileType?: 'step' | 'obj', element?: Array<'Component Model' | 'Via' | 'Silkscreen' | 'Wire In Signal Layer'>, modelMode?: 'Outfit' | 'Parts', autoGenerateModels?: boolean): Promise<File | undefined>;`
- `get3DShellFile(fileName?: string, fileType?: 'stl' | 'step' | 'obj'): Promise<File | undefined>;`
- `getPickAndPlaceFile(fileName?: string, fileType?: 'xlsx' | 'csv', unit?: ESYS_Unit.MILLIMETER | ESYS_Unit.MIL): Promise<File | undefined>;`
- `getFlyingProbeTestFile(fileName?: string): Promise<File | undefined>;`
- `getBomTemplates(): Promise<Array<string>>;`
- `uploadBomTemplateFile(templateFile: File, template?: string): Promise<string | undefined>;`
- `getBomTemplateFile(template: string): Promise<File | undefined>;`
- `deleteBomTemplate(template: string): Promise<boolean>;`
- `getTestPointFile(fileName?: string, fileType?: 'xlsx' | 'csv'): Promise<File | undefined>;`
- `getNetlistFile(fileName?: string, netlistType?: ESYS_NetlistType): Promise<File | undefined>;`
- `getIpcD356AFile(fileName?: string): Promise<File | undefined>;`
- `getDsnFile(fileName?: string): Promise<File | undefined>;`
- `getAutoRouteJsonFile(fileName?: string): Promise<File | undefined>;`
- `getAutoLayoutJsonFile(fileName?: string): Promise<File | undefined>;`
- `getAltiumDesignerFile(fileName?: string): Promise<File | undefined>;`
- `getPadsFile(fileName?: string): Promise<File | undefined>;`
- `getPcbInfoFile(fileName?: string): Promise<File | undefined>;`
- `placeComponentsOrder(interactive?: boolean, ignoreWarning?: boolean): Promise<boolean>;`
- `placeSmtComponentsOrder(interactive?: boolean, ignoreWarning?: boolean): Promise<boolean>;`
- `placePcbOrder(interactive?: boolean, ignoreWarning?: boolean): Promise<boolean>;`
- `place3DShellOrder(interactive?: boolean, ignoreWarning?: boolean): Promise<boolean>;`

### [PCB_MathPolygon](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_mathpolygon.html)

- `createPolygon(polygon: TPCB_PolygonSourceArray): IPCB_Polygon | undefined;`
- `createComplexPolygon(complexPolygon: TPCB_PolygonSourceArray | Array<TPCB_PolygonSourceArray> | IPCB_Polygon | Array<IPCB_Polygon>): IPCB_ComplexPolygon | undefined;`
- `splitPolygon(...complexPolygons: Array<IPCB_ComplexPolygon>): Array<IPCB_Polygon>;`
- `calculateBBoxWidth(complexPolygon: TPCB_PolygonSourceArray | Array<TPCB_PolygonSourceArray>): number;`
- `calculateBBoxHeight(complexPolygon: TPCB_PolygonSourceArray | Array<TPCB_PolygonSourceArray>): number;`
- `convertImageToComplexPolygon(imageBlob: Blob, imageWidth: number, imageHeight: number, tolerance?: number, simplification?: number, smoothing?: number, despeckling?: number, whiteAsBackgroundColor?: boolean, inversion?: boolean): Promise<IPCB_ComplexPolygon | undefined>;`

### [PCB_Net](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_net.html)

- `getAllNetsName(): Promise<Array<string>>;`
- `getAllNetName(): Promise<Array<string>>;`
- `getNetLength(net: string): Promise<number | undefined>;`
- `getAllPrimitivesByNet(net: string, primitiveTypes?: Array<EPCB_PrimitiveType>): Promise<Array<IPCB_Primitive>>;`
- `selectNet(net: string): Promise<boolean>;`
- `highlightNet(net: string): Promise<boolean>;`
- `unhighlightNet(net: string): Promise<boolean>;`
- `getNetlist(type?: ESYS_NetlistType): Promise<string>;`
- `setNetlist(type: ESYS_NetlistType | undefined, netlist: string): Promise<boolean>;`

### [PCB_Primitive](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitive.html)
- 方法签名: （未在 d.ts 中提取到）

### [PCB_PrimitiveArc](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitivearc.html)

- `create(net: string, layer: TPCB_LayersOfLine, startX: number, startY: number, endX: number, endY: number, arcAngle: number, lineWidth?: number, interactiveMode?: EPCB_PrimitiveArcInteractiveMode, primitiveLock?: boolean): Promise<IPCB_PrimitiveArc | undefined>;`
- `delete(primitiveIds: string | IPCB_PrimitiveArc | Array<string> | Array<IPCB_PrimitiveArc>): Promise<boolean>;`
- `get(primitiveIds: string): Promise<IPCB_PrimitiveArc | undefined>;`
- `get(primitiveIds: Array<string>): Promise<Array<IPCB_PrimitiveArc>>;`
- `getAllPrimitiveId(net?: string, layer?: TPCB_LayersOfLine, primitiveLock?: boolean): Promise<Array<string>>;`
- `getAll(net?: string, layer?: TPCB_LayersOfLine, primitiveLock?: boolean): Promise<Array<IPCB_PrimitiveArc>>;`

### [PCB_PrimitiveAttribute](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitiveattribute.html)
- 方法签名: （未在 d.ts 中提取到）

### [PCB_PrimitiveComponent](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitivecomponent.html)

- `delete(primitiveIds: string | IPCB_PrimitiveComponent | Array<string> | Array<IPCB_PrimitiveComponent>): Promise<boolean>;`
- `get(primitiveIds: string): Promise<IPCB_PrimitiveComponent | undefined>;`
- `get(primitiveIds: Array<string>): Promise<Array<IPCB_PrimitiveComponent>>;`
- `getAllPrimitiveId(layer?: TPCB_LayersOfComponent, primitiveLock?: boolean): Promise<Array<string>>;`
- `getAll(layer?: TPCB_LayersOfComponent, primitiveLock?: boolean): Promise<Array<IPCB_PrimitiveComponent>>;`
- `getAllPinsByPrimitiveId(primitiveId: string): Promise<Array<IPCB_PrimitiveComponentPad> | undefined>;`

### [PCB_PrimitiveDimension](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitivedimension.html)

- `create(dimensionType: EPCB_PrimitiveDimensionType, coordinateSet: TPCB_PrimitiveDimensionCoordinateSet, layer?: TPCB_LayersOfDimension, unit?: ESYS_Unit.MILLIMETER | ESYS_Unit.CENTIMETER | ESYS_Unit.INCH | ESYS_Unit.MIL, lineWidth?: number, precision?: number, primitiveLock?: boolean): Promise<IPCB_PrimitiveDimension | undefined>;`
- `delete(primitiveIds: string | IPCB_PrimitiveDimension | Array<string> | Array<IPCB_PrimitiveDimension>): Promise<boolean>;`
- `get(primitiveIds: string): Promise<IPCB_PrimitiveDimension | undefined>;`
- `get(primitiveIds: Array<string>): Promise<Array<IPCB_PrimitiveDimension>>;`
- `getAllPrimitiveId(layer?: TPCB_LayersOfDimension, primitiveLock?: boolean): Promise<Array<string>>;`
- `getAll(layer?: TPCB_LayersOfDimension, primitiveLock?: boolean): Promise<Array<IPCB_PrimitiveDimension>>;`

### [PCB_PrimitiveFill](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitivefill.html)

- `create(layer: TPCB_LayersOfFill, complexPolygon: IPCB_Polygon, net?: string, fillMode?: EPCB_PrimitiveFillMode, lineWidth?: number, primitiveLock?: boolean): Promise<IPCB_PrimitiveFill | undefined>;`
- `delete(primitiveIds: string | IPCB_PrimitiveFill | Array<string> | Array<IPCB_PrimitiveFill>): Promise<boolean>;`
- `get(primitiveIds: string): Promise<IPCB_PrimitiveFill | undefined>;`
- `get(primitiveIds: Array<string>): Promise<Array<IPCB_PrimitiveFill>>;`
- `getAllPrimitiveId(layer?: TPCB_LayersOfFill, net?: string, primitiveLock?: boolean): Promise<Array<string>>;`
- `getAll(layer?: TPCB_LayersOfFill, net?: string, primitiveLock?: boolean): Promise<Array<IPCB_PrimitiveFill>>;`

### [PCB_PrimitiveImage](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitiveimage.html)

- `create(x: number, y: number, complexPolygon: TPCB_PolygonSourceArray | Array<TPCB_PolygonSourceArray> | IPCB_Polygon | IPCB_ComplexPolygon, layer: TPCB_LayersOfImage, width?: number, height?: number, rotation?: number, horizonMirror?: boolean, primitiveLock?: boolean): Promise<IPCB_PrimitiveImage | undefined>;`
- `delete(primitiveIds: string | IPCB_PrimitiveImage | Array<string> | Array<IPCB_PrimitiveImage>): Promise<boolean>;`
- `get(primitiveIds: string): Promise<IPCB_PrimitiveImage | undefined>;`
- `get(primitiveIds: Array<string>): Promise<Array<IPCB_PrimitiveImage>>;`
- `getAllPrimitiveId(layer?: TPCB_LayersOfImage, primitiveLock?: boolean): Promise<Array<string>>;`
- `getAll(layer?: TPCB_LayersOfImage, primitiveLock?: boolean): Promise<Array<IPCB_PrimitiveImage>>;`

### [PCB_PrimitiveLine](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitiveline.html)

- `create(net: string, layer: TPCB_LayersOfLine, startX: number, startY: number, endX: number, endY: number, lineWidth?: number, primitiveLock?: boolean): Promise<IPCB_PrimitiveLine | undefined>;`
- `delete(primitiveIds: string | IPCB_PrimitiveLine | Array<string> | Array<IPCB_PrimitiveLine>): Promise<boolean>;`
- `get(primitiveIds: string): Promise<IPCB_PrimitiveLine | undefined>;`
- `get(primitiveIds: Array<string>): Promise<Array<IPCB_PrimitiveLine>>;`
- `getAllPrimitiveId(net?: string, layer?: TPCB_LayersOfLine, primitiveLock?: boolean): Promise<Array<string>>;`
- `getAll(net?: string, layer?: TPCB_LayersOfLine, primitiveLock?: boolean): Promise<Array<IPCB_PrimitiveLine>>;`

### [PCB_PrimitiveObject](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitiveobject.html)

- `create(layer: TPCB_LayersOfObject, topLeftX: number, topLeftY: number, binaryData: string, width: number, height: number, rotation?: number, mirror?: boolean, fileName?: string, primitiveLock?: boolean): Promise<IPCB_PrimitiveObject | undefined>;`
- `delete(primitiveIds: string | IPCB_PrimitiveObject | Array<string> | Array<IPCB_PrimitiveObject>): Promise<boolean>;`
- `get(primitiveIds: string): Promise<IPCB_PrimitiveObject | undefined>;`
- `get(primitiveIds: Array<string>): Promise<Array<IPCB_PrimitiveObject>>;`
- `getAllPrimitiveId(layer?: TPCB_LayersOfObject, primitiveLock?: boolean): Promise<Array<string>>;`
- `getAll(layer?: TPCB_LayersOfObject, primitiveLock?: boolean): Promise<Array<IPCB_PrimitiveObject>>;`

### [PCB_PrimitivePad](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitivepad.html)

- `create(layer: TPCB_LayersOfPad, padNumber: string, x: number, y: number, rotation?: number, pad?: TPCB_PrimitivePadShape, net?: string, hole?: TPCB_PrimitivePadHole | null, holeOffsetX?: number, holeOffsetY?: number, holeRotation?: number, metallization?: boolean, padType?: EPCB_PrimitivePadType, specialPad?: TPCB_PrimitiveSpecialPadShape, solderMaskAndPasteMaskExpansion?: IPCB_PrimitiveSolderMaskAndPasteMaskExpansion | null, heatWelding?: IPCB_PrimitivePadHeatWelding | null, primitiveLock?: boolean): Promise<IPCB_PrimitivePad | undefined>;`
- `delete(primitiveIds: string | IPCB_PrimitivePad | Array<string> | Array<IPCB_PrimitivePad>): Promise<boolean>;`
- `get(primitiveIds: string): Promise<IPCB_PrimitivePad | undefined>;`
- `get(primitiveIds: Array<string>): Promise<Array<IPCB_PrimitivePad>>;`
- `getAllPrimitiveId(layer?: TPCB_LayersOfPad, net?: string, primitiveLock?: boolean, padType?: EPCB_PrimitivePadType): Promise<Array<string>>;`
- `getAll(layer?: TPCB_LayersOfPad, net?: string, primitiveLock?: boolean, padType?: EPCB_PrimitivePadType): Promise<Array<IPCB_PrimitivePad>>;`

### [PCB_PrimitivePolyline](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitivepolyline.html)

- `create(net: string, layer: TPCB_LayersOfLine, polygon: IPCB_Polygon, lineWidth?: number, primitiveLock?: boolean): Promise<IPCB_PrimitivePolyline | undefined>;`
- `delete(primitiveIds: string | IPCB_PrimitivePolyline | Array<string> | Array<IPCB_PrimitivePolyline>): Promise<boolean>;`
- `get(primitiveIds: string): Promise<IPCB_PrimitivePolyline | undefined>;`
- `get(primitiveIds: Array<string>): Promise<Array<IPCB_PrimitivePolyline>>;`
- `getAllPrimitiveId(net?: string, layer?: TPCB_LayersOfLine, primitiveLock?: boolean): Promise<Array<string>>;`
- `getAll(net?: string, layer?: TPCB_LayersOfLine, primitiveLock?: boolean): Promise<Array<IPCB_PrimitivePolyline>>;`

### [PCB_PrimitivePour](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitivepour.html)

- `create(net: string, layer: TPCB_LayersOfCopper, complexPolygon: IPCB_Polygon, pourFillMethod?: EPCB_PrimitivePourFillMethod, preserveSilos?: boolean, pourName?: string, pourPriority?: number, lineWidth?: number, primitiveLock?: boolean): Promise<IPCB_PrimitivePour | undefined>;`
- `delete(primitiveIds: string | IPCB_PrimitivePour | Array<string> | Array<IPCB_PrimitivePour>): Promise<boolean>;`
- `get(primitiveIds: string): Promise<IPCB_PrimitivePour | undefined>;`
- `get(primitiveIds: Array<string>): Promise<Array<IPCB_PrimitivePour>>;`
- `getAllPrimitiveId(net?: string, layer?: TPCB_LayersOfCopper, primitiveLock?: boolean): Promise<Array<string>>;`
- `getAll(net?: string, layer?: TPCB_LayersOfCopper, primitiveLock?: boolean): Promise<Array<IPCB_PrimitivePour>>;`

### [PCB_PrimitivePoured](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitivepoured.html)
- 方法签名: （未在 d.ts 中提取到）

### [PCB_PrimitiveRegion](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitiveregion.html)

- `create(layer: TPCB_LayersOfRegion, complexPolygon: IPCB_Polygon, ruleType?: Array<EPCB_PrimitiveRegionRuleType>, regionName?: string, lineWidth?: number, primitiveLock?: boolean): Promise<IPCB_PrimitiveRegion | undefined>;`
- `delete(primitiveIds: string | IPCB_PrimitiveRegion | Array<string> | Array<IPCB_PrimitiveRegion>): Promise<boolean>;`
- `get(primitiveIds: string): Promise<IPCB_PrimitiveRegion | undefined>;`
- `get(primitiveIds: Array<string>): Promise<Array<IPCB_PrimitiveRegion>>;`
- `getAllPrimitiveId(layer?: TPCB_LayersOfRegion, ruleType?: Array<EPCB_PrimitiveRegionRuleType>, primitiveLock?: boolean): Promise<Array<string>>;`
- `getAll(layer?: TPCB_LayersOfRegion, ruleType?: Array<EPCB_PrimitiveRegionRuleType>, primitiveLock?: boolean): Promise<Array<IPCB_PrimitiveRegion>>;`

### [PCB_PrimitiveString](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitivestring.html)
- 方法签名: （未在 d.ts 中提取到）

### [PCB_PrimitiveVia](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_primitivevia.html)

- `create(net: string, x: number, y: number, holeDiameter: number, diameter: number, viaType?: EPCB_PrimitiveViaType, designRuleBlindViaName?: string | null, solderMaskExpansion?: IPCB_PrimitiveSolderMaskAndPasteMaskExpansion | null, primitiveLock?: boolean): Promise<IPCB_PrimitiveVia | undefined>;`
- `delete(primitiveIds: string | IPCB_PrimitiveVia | Array<string> | Array<IPCB_PrimitiveVia>): Promise<boolean>;`
- `get(primitiveIds: string): Promise<IPCB_PrimitiveVia | undefined>;`
- `get(primitiveIds: Array<string>): Promise<Array<IPCB_PrimitiveVia>>;`
- `getAllPrimitiveId(net?: string, primitiveLock?: boolean): Promise<Array<string>>;`
- `getAll(net?: string, primitiveLock?: boolean): Promise<Array<IPCB_PrimitiveVia>>;`

### [PCB_SelectControl](https://prodocs.lceda.cn/cn/api/reference/pro-api.pcb_selectcontrol.html)

- `getAllSelectedPrimitives_PrimitiveId(): Promise<Array<string>>;`
- `getAllSelectedPrimitives(): Promise<Array<IPCB_Primitive>>;`
- `getSelectedPrimitives(): Promise<Array<Object>>;`
- `doSelectPrimitives(primitiveIds: string | Array<string>): Promise<boolean>;`
- `doCrossProbeSelect(components?: Array<string>, pins?: Array<string>, nets?: Array<string>, highlight?: boolean, select?: boolean): Promise<boolean>;`
- `clearSelected(): Promise<boolean>;`

## PCB Interfaces

- [IPCB_BomPropertiesTableColumns](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_bompropertiestablecolumns.html)
- [IPCB_DifferentialPairItem](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_differentialpairitem.html)
- [IPCB_EqualLengthNetGroupItem](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_equallengthnetgroupitem.html)
- [IPCB_LayerItem](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_layeritem.html)
- [IPCB_NetClassItem](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_netclassitem.html)
- [IPCB_NetInfo](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_netinfo.html)
- [IPCB_PadPairGroupItem](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_padpairgroupitem.html)
- [IPCB_PadPairMinWireLengthItem](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_padpairminwirelengthitem.html)
- [IPCB_Primitive](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitive.html)
- [IPCB_PrimitiveAPI](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitiveapi.html)
- [IPCB_PrimitivePadHeatWelding](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivepadheatwelding.html)
- [IPCB_PrimitivePouredPourFill](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivepouredpourfill.html)
- [IPCB_PrimitiveSolderMaskAndPasteMaskExpansion](https://prodocs.lceda.cn/cn/api/reference/pro-api.ipcb_primitivesoldermaskandpastemaskexpansion.html)

## PCB Enums

- [EPCB_DocumentRatlineCalculatingActiveStatus](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_documentratlinecalculatingactivestatus.html)
- [EPCB_InactiveLayerDisplayMode](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_inactivelayerdisplaymode.html)
- [EPCB_LayerColorConfiguration](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_layercolorconfiguration.html)
- [EPCB_LayerId](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_layerid.html)
- [EPCB_LayerType](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_layertype.html)
- [EPCB_MouseEventType](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_mouseeventtype.html)
- [EPCB_PcbPlateType](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_pcbplatetype.html)
- [EPCB_PdfOutputMethod](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_pdfoutputmethod.html)
- [EPCB_PrimitiveArcInteractiveMode](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_primitivearcinteractivemode.html)
- [EPCB_PrimitiveDimensionType](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_primitivedimensiontype.html)
- [EPCB_PrimitiveEventType](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_primitiveeventtype.html)
- [EPCB_PrimitiveFillMode](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_primitivefillmode.html)
- [EPCB_PrimitivePadHeatWeldingConnectionMethod](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_primitivepadheatweldingconnectionmethod.html)
- [EPCB_PrimitivePadHoleType](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_primitivepadholetype.html)
- [EPCB_PrimitivePadShapeType](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_primitivepadshapetype.html)
- [EPCB_PrimitivePadType](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_primitivepadtype.html)
- [EPCB_PrimitivePourFillMethod](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_primitivepourfillmethod.html)
- [EPCB_PrimitiveRegionRuleType](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_primitiveregionruletype.html)
- [EPCB_PrimitiveStringAlignMode](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_primitivestringalignmode.html)
- [EPCB_PrimitiveType](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_primitivetype.html)
- [EPCB_PrimitiveViaType](https://prodocs.lceda.cn/cn/api/reference/pro-api.epcb_primitiveviatype.html)
