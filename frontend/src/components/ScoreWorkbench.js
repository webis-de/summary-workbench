import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import Plot from "react-plotly.js";
import { useKey, useToggle } from "react-use";

import { HoverContext } from "../contexts/HoverContext";
import { useMarkup } from "../hooks/markup";
import { arrayEqual, mapObject } from "../utils/common";
import formatters from "../utils/export";
import { range, zip } from "../utils/python";
import { CopyToClipboardButton } from "./utils/Button";
import { Card, CardContent, CardHead } from "./utils/Card";
import { Checkbox, Input } from "./utils/Form";
import { EyeClosed, EyeOpen } from "./utils/Icons";
import { Markup } from "./utils/Markup";
import { Pagination, usePagination } from "./utils/Pagination";
import { ButtonGroup, RadioButton, RadioGroup } from "./utils/Radio";
import { Table, TableWrapper, Tbody, Td, Th, Thead, Tr } from "./utils/Table";
import { Pill, TabContent, TabHead, TabPanel, Tabs } from "./utils/Tabs";
import { HeadingMedium, HeadingSemiBig, HeadingSmall } from "./utils/Text";
import { Toggle } from "./utils/Toggle";

const ExportPreview = ({ format, rownames, colnames, table }) => {
  const [transpose, toggleTranspose] = useToggle(true);
  const [precision, setPrecision] = useState(3);
  const updatePrecision = (newValue) => {
    let value = parseInt(newValue.replace(/\D/g, "") || "3", 10);
    if (value > 30) value = 30;
    setPrecision(value);
  };

  const text = useMemo(
    () => formatters[format](rownames, colnames, table, transpose, precision),
    [format, rownames, colnames, table, transpose, precision]
  );
  return (
    <div className="pt-5">
      <div className="relative">
        <pre className="p-6 border border-gray-900 overflow-auto">
          <div className="absolute right-3 top-3 z-10">
            <div className="flex items-center gap-4">
              <div className="w-16">
                <Input
                  placeholder="digits"
                  small
                  right
                  onChange={(e) => {
                    updatePrecision(e.currentTarget.value);
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <HeadingSmall>transpose</HeadingSmall>
                <Toggle checked={transpose} onChange={() => toggleTranspose()} />
              </div>
              <CopyToClipboardButton text={text} />
            </div>
          </div>
          {text}
        </pre>
      </div>
    </div>
  );
};

const ScoreTable = ({ calculation }) => {
  const { rows, columns, table } = calculation;
  const [format, setFormat] = useState(null);
  return (
    <div>
      <TableWrapper>
        <Table>
          <Thead>
            <Th>Metric</Th>
            {columns.map((colname) => (
              <Th key={colname}>{colname}</Th>
            ))}
          </Thead>
          <Tbody>
            {table.map((row, i) => {
              const metric = rows[i];
              return (
                <Tr key={metric} hover striped>
                  <Td>{metric}</Td>
                  {row.map((score, j) => (
                    <Td key={j}>{score.toFixed(3)}</Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableWrapper>
      <div className="mt-5 flex items-center gap-8">
        <HeadingSemiBig>Export</HeadingSemiBig>
        <RadioGroup value={format} setValue={setFormat}>
          <ButtonGroup direction="horizontal">
            {Object.keys(formatters).map((formatter) => (
              <RadioButton key={formatter} value={formatter}>
                <span className="uppercase">{formatter}</span>
              </RadioButton>
            ))}
          </ButtonGroup>
        </RadioGroup>
      </div>
      {format && <ExportPreview format={format} rownames={rows} colnames={columns} table={table} />}
    </div>
  );
};

const isMarkup = (markup) => !(typeof markup === "string");

const ToggleOverlap = ({ markupKeys, wantMarkupKeys, setMarkupKeys }) => {
  const show = !arrayEqual(markupKeys, wantMarkupKeys);
  const Icon = show ? EyeOpen : EyeClosed;
  const onClick = show ? () => setMarkupKeys(wantMarkupKeys) : () => setMarkupKeys([]);

  return (
    <button
      className="whitespace-nowrap hover:text-blue-600 flex items-center gap-1"
      onClick={onClick}
    >
      <Icon className="w-7 h-7" /> {wantMarkupKeys[0]}
    </button>
  );
};

const MarkupOrText = ({ markup, markupState }) =>
  isMarkup(markup) ? (
    <Markup markups={markup} markupState={markupState} />
  ) : (
    <div className="leading-[23px]">{markup}</div>
  );

const ModelCard = ({ name, markup, markupKeys, markupState, setMarkupKeys, hasDocument }) => (
  <Card full key={name}>
    <CardHead tight>
      <HeadingSemiBig>{name}</HeadingSemiBig>
      <div className="flex gap-4">
        {hasDocument && (
          <ToggleOverlap
            markupKeys={markupKeys}
            wantMarkupKeys={["document", name]}
            setMarkupKeys={setMarkupKeys}
          />
        )}
        {name !== "reference" && (
          <ToggleOverlap
            markupKeys={markupKeys}
            wantMarkupKeys={["reference", name]}
            setMarkupKeys={setMarkupKeys}
          />
        )}
      </div>
    </CardHead>
    <CardContent>
      <MarkupOrText markup={markup} markupState={markupState} />
    </CardContent>
  </Card>
);

class MarkupMatrix {
  constructor(calculation) {
    const { documents, references, modeltexts } = calculation;
    this.length = references.length;
    this.modelKeys = Object.keys(modeltexts);
    this.all = { reference: references, ...modeltexts };
    if (documents !== undefined) this.all.document = documents;
  }

  getFromKeys(index, keys) {
    return keys.map((k) => this.all[k][index]);
  }

  get(index, markups) {
    return mapObject(this.all, (v, k) => (markups && markups[k] ? markups[k] : v[index]));
  }
}

const Visualize = ({ calculation }) => {
  const matrix = useMemo(() => new MarkupMatrix(calculation), [calculation]);
  const [chosenModels, setChosenModels] = useState(() =>
    Object.fromEntries(matrix.modelKeys.map((k) => [k, true]))
  );
  const { numPages, page, setPage } = usePagination(matrix.length, { initialSize: 1 });

  const hovered = useContext(HoverContext);
  useKey("ArrowLeft", () => hovered && setPage((old) => old - 1), {}, [hovered]);
  useKey("ArrowRight", () => hovered && setPage((old) => old + 1), {}, [hovered]);

  const [markupKeys, setMarkupKeys] = useState([]);

  const index = page - 1;
  const markups = useMarkup(...matrix.getFromKeys(index, markupKeys));

  const {
    document: doc,
    reference,
    ...models
  } = matrix.get(index, Object.fromEntries(zip(markupKeys, markups)));
  const markupState = useState(null);

  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {Object.entries(chosenModels).map(([model, checked]) => (
          <Checkbox
            key={model}
            checked={checked}
            onChange={() =>
              setChosenModels((oldState) => ({ ...oldState, [model]: !oldState[model] }))
            }
          >
            {model}
          </Checkbox>
        ))}
      </div>
      <div className="pb-3 flex justify-center">
        <Pagination page={page} numPages={numPages} setPage={setPage} />
      </div>
      <div className="flex items-top gap-3">
        {doc !== undefined && (
          <div className="basis-[45%]">
            <div>
              <Card full>
                <CardHead tight>
                  <HeadingSemiBig>Document</HeadingSemiBig>
                </CardHead>
                <CardContent>
                  <MarkupOrText markup={doc} markupState={markupState} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        <div className="basis-[55%] grow">
          <div className="flex flex-col gap-3">
            <ModelCard
              name="reference"
              markup={reference}
              markupKeys={markupKeys}
              markupState={markupState}
              setMarkupKeys={setMarkupKeys}
              hasDocument={doc !== undefined}
            />
            {Object.entries(models)
              .filter(([name]) => chosenModels[name])
              .sort()
              .map(([name, markup]) => (
                <ModelCard
                  key={name}
                  name={name}
                  markup={markup}
                  markupKeys={markupKeys}
                  markupState={markupState}
                  setMarkupKeys={setMarkupKeys}
                  hasDocument={doc !== undefined}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

class PlotMatrix {
  constructor(calculation) {
    const { documents, references, modeltexts, scores, columns, rows } = calculation;
    this.columns = columns;
    this.rows = rows;
    this.models = modeltexts;
    this.documents = documents;
    this.references = references;
    this.scores = scores;
    this.jitter = {
      scores: range(references.length).map(() => Math.random()),
      label: "uniform jitter",
    };
    this.defaultScores = {
      scores: [],
      label: "nothing selected",
    };
  }

  fromCoord([row, col]) {
    const rowname = this.rows[row];
    const colname = this.columns[col];
    return {
      scores: this.scores[colname][rowname],
      texts: this.models[colname],
      model: colname,
      label: `${rowname}     (${colname})`,
    };
  }

  get(metrics) {
    const colnames = this.columns;
    const rownames = this.rows;
    const table = rownames.map((rowname) =>
      colnames.map((colname) => {
        if (!this.scores[colname][rowname]) return undefined;
        return false;
      })
    );
    metrics.forEach(([row, col]) => {
      table[row][col] = true;
    });
    let plotData = metrics.map((e) => this.fromCoord(e));
    const [x, y] = plotData;
    if (!x) plotData = [this.defaultScores, this.defaultScores];
    else if (!y) plotData = [x, this.jitter];

    return { colnames, rownames, table, plotData };
  }
}

const SetButton = ({ isSet, children, ...props }) => {
  let className = "py-2 px-4 text-sm font-medium";
  if (isSet === undefined) className += " text-gray-900 bg-white cursor-default opacity-50";
  else if (isSet) className += " bg-gray-600 text-white ring-[3px] ring-black";
  else
    className += " text-gray-900 bg-white hover:text-white hover:bg-gray-400 ring-1 ring-gray-700";
  return (
    <button {...props} disabled={isSet === undefined} className={className}>
      {children}
    </button>
  );
};

const computePlot = (x, y, page, selectedPoints) => {
  const color = Array(x.scores.length).fill("#8682FF");
  const size = Array(x.scores.length).fill(7);
  let selected = selectedPoints;
  if (selected === undefined || !x.scores.length) selected = [];
  const currIndex = selected[page - 1];
  if (currIndex !== undefined) {
    color[currIndex] = "yellow";
    size[currIndex] = 13;
  }
  const data = {
    x: x.scores,
    y: y.scores,
    selectedpoints: selected.length ? selected : null,
    marker: { color, size, line: { width: 1, color: "DarkSlateGrey" } },
  };
  return { x, y, data, selected };
};

const usePlot = ([inX, inY], references, documents) => {
  const [{ x, y, data, selected }, setData] = useState({ selected: [] });
  const layout = useMemo(() => {
    if (x)
      return {
        xaxis: {
          autorange: true,
          title: x.label,
          range: undefined,
          type: "linear",
        },
        yaxis: {
          autorange: true,
          title: y.label,
          range: undefined,
          type: "linear",
        },
      };
    return {};
  }, [x, y]);
  const { numPages, page, setPage } = usePagination(selected.length, {
    initialSize: 1,
    reset: true,
  });
  useEffect(() => {
    setData(({ selected: oldSelected }) => computePlot(inX, inY, page, oldSelected));
  }, [inX, inY, page]);
  const setSelected = useCallback(
    (pointIndexes) => setData(computePlot(x, y, page, pointIndexes)),
    [x, y, page, selected]
  );
  const onSelected = (e) => e && setSelected(e.points.map(({ pointIndex }) => pointIndex));
  const onDeselect = () => setSelected([]);
  const setHighlightedPoint = (pointIndex) => {
    const index = selected.indexOf(pointIndex);
    if (index >= 0) setPage(index + 1);
    else setSelected([pointIndex]);
  };
  const [modelScores, doc, reference, model1, model2] = useMemo(() => {
    const index = selected[page - 1];
    if (index === undefined) return [];
    const modelScores_ = {
      [x.label]: x.scores[index],
    };
    const reference_ = references[index];
    let doc_;
    if (documents) doc_ = documents[index];
    const model1_ = [x.model, x.texts[index]];
    let model2_;
    if (y.model) {
      modelScores_[y.label] = y.scores[index];
      if (x.model !== y.model) model2_ = [y.model, y.texts[index]];
    }
    return [modelScores_, doc_, reference_, model1_, model2_];
  }, [selected, references, documents, page, x, y]);
  return {
    data,
    layout,
    selected,
    text: { modelScores, document: doc, reference, model1, model2 },
    pagination: { setPage, page, numPages },
    onSelected,
    onDeselect,
    setHighlightedPoint,
  };
};

const Plotter = ({ calculation }) => {
  const matrix = useMemo(() => new PlotMatrix(calculation), [calculation]);
  const [selectedMetrics, toggleMetric] = useReducer((oldState, value) => {
    const newState = oldState.filter((arr) => !arrayEqual(arr, value));
    if (oldState.length !== newState.length) return newState;
    return [...newState.slice(-1), value];
  }, []);
  const { colnames, rownames, table, plotData } = useMemo(
    () => matrix.get(selectedMetrics),
    [matrix, selectedMetrics]
  );
  const {
    data: dataPatch,
    layout: layoutPatch,
    text: { modelScores, document: doc, reference, model1, model2 },
    pagination: { numPages, page, setPage },
    onSelected,
    onDeselect,
    setHighlightedPoint,
  } = usePlot(plotData, matrix.references, matrix.documents);
  const data = useMemo(
    () => [
      {
        ...dataPatch,
        // text: [],
        // hoverinfo: "text",
        // customdata:
        type: "scatter",
        mode: "markers",
        hoverlabel: { bgcolor: "black" },
      },
    ],
    [dataPatch]
  );
  const layout = useMemo(
    () => ({
      ...layoutPatch,
      modebar: {
        orientation: "v",
      },
      dragmode: "select",
      autosize: true,
      uirevision: true,
      margin: {
        t: 20,
        r: 25,
        l: 60,
        b: 60,
      },
    }),
    [layoutPatch]
  );
  const [trueLayout, setTrueLayout] = useState({});
  useEffect(() => setTrueLayout(layout), [layout]);
  return (
    <div>
      <TableWrapper>
        <Table>
          <Thead>
            <Th>Metric</Th>
            {colnames.map((colname) => (
              <Th key={colname}>{colname}</Th>
            ))}
          </Thead>
          <Tbody>
            {table.map((row, i) => {
              const metric = rownames[i];
              return (
                <Tr key={metric} striped>
                  <Td>{metric}</Td>
                  {row.map((isSet, j) => (
                    <Td key={j} loose>
                      <SetButton isSet={isSet} onClick={() => toggleMetric([i, j])}>
                        toggle
                      </SetButton>
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableWrapper>
      {data && (
        <div className="grid grid-cols-2 py-4 px-2 gap-5">
          <div className="border border-black">
            <Plot
              className="w-full min-h-[500px]"
              data={data}
              layout={trueLayout}
              config={{
                displayModeBar: true,
                responsive: true,
              }}
              onInitialized={({ layout: newLayout }) => setTrueLayout(newLayout)}
              onUpdate={({ layout: newLayout }) => setTrueLayout(newLayout)}
              onSelected={onSelected}
              onDeselect={onDeselect}
              onClick={({ points }) => setHighlightedPoint(points[0].pointIndex)}
            />
          </div>
          <div>
            {reference !== undefined && (
              <div>
                <div className="flex justify-center">
                  <Pagination page={page} numPages={numPages} setPage={setPage} />
                </div>
                <div className="flex flex-col gap-3 mt-4">
                  {doc !== undefined && (
                    <div>
                      <HeadingMedium>Document</HeadingMedium>
                      <div>{doc}</div>
                    </div>
                  )}
                  <div>
                    <HeadingMedium>Reference</HeadingMedium>
                    <div>{reference}</div>
                  </div>
                  <div>
                    <HeadingMedium>{model1[0]}</HeadingMedium>
                    <div>{model1[1]}</div>
                  </div>
                  {model2 && (
                    <div>
                      <HeadingMedium>{model2[0]}</HeadingMedium>
                      <div>{model2[1]}</div>
                    </div>
                  )}
                  <table className="inline-block mt-7">
                    <tbody>
                      {Object.entries(modelScores).map(([name, score]) => (
                        <tr key={name}>
                          <td>
                            <HeadingSmall>{name}</HeadingSmall>
                          </td>
                          <td className="pl-4">{score.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ScoreWorkbench = ({ calculation, RightToken }) => {
  const hasScores = Boolean(calculation.table.length);
  return (
    <div>
      <Tabs>
        <div className="mb-5 flex items-center justify-between">
          <TabHead>
            {hasScores && <Pill>Scores</Pill>}
            <Pill>Visualize Overlap</Pill>
            {hasScores && <Pill>Plotter</Pill>}
          </TabHead>
          {RightToken}
        </div>
        <TabContent>
          {hasScores && (
            <TabPanel>
              <ScoreTable calculation={calculation} />
            </TabPanel>
          )}
          <TabPanel>
            <Visualize calculation={calculation} />
          </TabPanel>
          {hasScores && (
            <TabPanel>
              <Plotter calculation={calculation} />
            </TabPanel>
          )}
        </TabContent>
      </Tabs>
    </div>
  );
};

export { ScoreWorkbench };
