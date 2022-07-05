import { memo, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import Plot from "react-plotly.js";
import { useKey, useToggle } from "react-use";

import { HoverContext } from "../contexts/HoverContext";
import { useMarkup } from "../hooks/markup";
import { arrayEqual, mapObject } from "../utils/common";
import formatters from "../utils/export";
import { range } from "../utils/python";
import { CopyToClipboardButton } from "./utils/Button";
import { Card, CardContent, CardHead } from "./utils/Card";
import { Checkbox, Input } from "./utils/Form";
import { EyeClosed, EyeOpen } from "./utils/Icons";
import { Loading } from "./utils/Loading";
import { Markup, useMarkupScroll } from "./utils/Markup";
import { Pagination, usePagination } from "./utils/Pagination";
import { ButtonGroup, RadioButton, RadioGroup } from "./utils/Radio";
import { Table, TableWrapper, Tbody, Td, Th, Thead, Tr } from "./utils/Table";
import { Pill, TabContent, TabHead, TabPanel, Tabs } from "./utils/Tabs";
import { HeadingSemiBig, HeadingSmall } from "./utils/Text";
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

const ToggleOverlap = ({ markupKeys, wantMarkupKeys, setMarkupKeys }) => {
  const show = !arrayEqual(markupKeys, wantMarkupKeys);
  const Icon = show ? EyeOpen : EyeClosed;
  const onClick = show ? () => setMarkupKeys(wantMarkupKeys) : () => setMarkupKeys([]);
  let text;
  if (wantMarkupKeys[2] === "semantic") text = "Sem-Doc";
  else {
    const type = wantMarkupKeys[0];
    if (type === "document") text = "Lex-Doc";
    else if (type === "reference") text = "Lex-Ref";
    else throw new Error(`unknown type ${type}`);
  }

  return (
    <button
      className="whitespace-nowrap hover:text-blue-600 flex items-center gap-1"
      onClick={onClick}
    >
      <Icon className="w-7 h-7" /> {text}
    </button>
  );
};

const colorFromStrength = (value) => {
  const v = Math.max(Math.min(value * 0.5, 1.0), 0.0);
  return `rgba(255, 0, 0, ${v})`;
};

const computeRank = (list) =>
  list
    .map((score, i) => [score, i])
    .sort(([a], [b]) => b - a)
    .map((e) => e[1]);

const sentenceWeightFromScores = (scores, numDocumentSentences, limit = 3) => {
  const weights = [...Array(numDocumentSentences)].fill(0);
  scores.map(computeRank).forEach((ranks) => {
    ranks.slice(0, limit).forEach((e) => {
      weights[e] += 1;
    });
  });
  return weights.map((e) => e / scores.length);
};

const SemanticMarkup = memo(({ markup }) => {
  const { documentSentences, scores } = markup;
  const weights = sentenceWeightFromScores(scores, documentSentences.length);
  return (
    <div className="leading-[22px]">
      {weights.map((weight, i) => (
        <span
          key={i}
          style={{
            padding: 0,
            paddingTop: "0.1em",
            paddingBottom: "0.1em",
            background: weight ? colorFromStrength(weight) : null,
          }}
        >
          {documentSentences[i]}
        </span>
      ))}
    </div>
  );
});

const MarkupOrText = ({ markup, markupState, scrollState }) => {
  if (typeof markup === "string") return <div className="leading-[22px]">{markup}</div>;
  const { type } = markup;
  switch (type) {
    case "loading":
      return <Loading />;
    case "lexical":
      return <Markup markups={markup.markup} markupState={markupState} scrollState={scrollState} />;
    case "semantic":
      return <SemanticMarkup markup={markup.markup} />;
    default:
      throw new Error(`unknown markup type: ${type}`);
  }
};

const ModelCard = ({
  name,
  markup,
  markupKeys,
  markupState,
  setMarkupKeys,
  hasDocument,
  scrollState,
}) => (
  <Card full key={name}>
    <CardHead tight>
      <HeadingSemiBig>{name}</HeadingSemiBig>
      <div className="flex gap-4">
        {hasDocument && (
          <>
            <ToggleOverlap
              markupKeys={markupKeys}
              wantMarkupKeys={["document", name, "semantic"]}
              setMarkupKeys={setMarkupKeys}
            />
            <ToggleOverlap
              markupKeys={markupKeys}
              wantMarkupKeys={["document", name, "lexical"]}
              setMarkupKeys={setMarkupKeys}
            />
          </>
        )}
        {name !== "reference" && (
          <ToggleOverlap
            markupKeys={markupKeys}
            wantMarkupKeys={["reference", name, "lexical"]}
            setMarkupKeys={setMarkupKeys}
          />
        )}
      </div>
    </CardHead>
    <CardContent tight>
      <MarkupOrText markup={markup} markupState={markupState} scrollState={scrollState} />
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

  get(index, markupModels, markups) {
    const markupMapper = {};
    if (markups) {
      const { type, loading, markup } = markups;
      if (loading) {
        if (type === "semantic") markupMapper[markupModels[0]] = { type: "loading" };
        else
          markupModels.forEach((model) => {
            markupMapper[model] = { type: "loading" };
          });
      } else if (markup) {
        if (type === "semantic") markupMapper[markupModels[0]] = { type, markup: markups.markup };
        else
          markupModels.forEach((model, i) => {
            markupMapper[model] = { type, markup: markups.markup[i] };
          });
      }
    }
    return mapObject(this.all, (v, k) => {
      const markup = markupMapper[k];
      if (markup) return markup;
      return v[index];
    });
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
  const markupModels = markupKeys.slice(0, 2);
  const markupType = markupKeys[2];
  const [d, r] = matrix.getFromKeys(index, markupModels);
  const markups = useMarkup(d, r, markupType);
  const { document: doc, reference, ...models } = matrix.get(index, markupModels, markups);
  const markupState = useState(null);
  const markupDeps = useMemo(() => [...markupKeys, index], [markupKeys, index]);
  const scrollState = useMarkupScroll(markupDeps);

  const allIsChecked = useMemo(() => Object.values(chosenModels).every((e) => e), [chosenModels]);

  return (
    <div>
      {Boolean(Object.keys(chosenModels).length) && (
        <Checkbox
          checked={allIsChecked}
          onChange={() => setChosenModels((oldState) => mapObject(oldState, () => !allIsChecked))}
          bold
        >
          toggle all models
        </Checkbox>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
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
                <CardContent tight>
                  <MarkupOrText markup={doc} markupState={markupState} scrollState={scrollState} />
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
              scrollState={scrollState}
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
                  scrollState={scrollState}
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
  const data = [
    {
      x: x.scores,
      y: y.scores,
      // text: [],
      // hoverinfo: "text",
      // customdata:
      type: "scatter",
      mode: "markers",
      hoverlabel: { bgcolor: "black" },
      selectedpoints: selected.length ? selected : null,
      marker: { color, size, line: { width: 1, color: "DarkSlateGrey" } },
    },
    {
      x: x.scores,
      // text: [],
      // hoverinfo: "text",
      // customdata:
      xaxis: "x1",
      yaxis: "y2",
      type: "histogram",
      marker: { color, size, line: { width: 1, color: "DarkSlateGrey" } },
    },
    {
      y: y.scores,
      // text: [],
      // hoverinfo: "text",
      // customdata:
      xaxis: "x2",
      yaxis: "y1",
      type: "histogram",
      marker: { color, size, line: { width: 1, color: "DarkSlateGrey" } },
    },
  ];
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
          domain: [0, 0.7],
        },
        yaxis: {
          autorange: true,
          title: y.label,
          range: undefined,
          type: "linear",
          domain: [0, 0.7],
        },
        xaxis2: {
          autorange: true,
          range: undefined,
          type: "linear",
          domain: [0.8, 1],
        },
        yaxis2: {
          autorange: true,
          range: undefined,
          type: "linear",
          domain: [0.8, 1],
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
    [x, y, page]
  );
  const onSelected = (e) => {
    if (e && e.range.x && e.range.y) {
      setSelected(e.points.map(({ pointIndex }) => pointIndex));
    }
  };
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

const ExampleDisplay = ({ modelScores, doc: doc_, reference: reference_, model1, model2 }) => {
  const [markupKeys, setMarkupKeys] = useState([]);

  const matrix = useMemo(() => {
    const calculation = { documents: [doc_], references: [reference_], modeltexts: {} };
    [model1, model2]
      .filter((v) => v !== undefined)
      .forEach(([k, v]) => {
        calculation.modeltexts[k] = [v];
      });
    return new MarkupMatrix(calculation);
  }, [doc_, reference_, model1, model2]);

  const markupModels = markupKeys.slice(0, 2);
  const markupType = markupKeys[2];
  const [d, r] = matrix.getFromKeys(0, markupModels);
  const markups = useMarkup(d, r, markupType);
  const { document: doc, reference, ...models } = matrix.get(0, markupModels, markups);
  const markupState = useState(null);
  const scrollState = useMarkupScroll(markupKeys);

  return (
    <div>
      <div className="flex flex-col gap-3 mt-4">
        {doc !== undefined && (
          <div>
            <Card full>
              <CardHead tight>
                <HeadingSemiBig>Document</HeadingSemiBig>
              </CardHead>
              <CardContent tight>
                <MarkupOrText markup={doc} markupState={markupState} scrollState={scrollState} />
              </CardContent>
            </Card>
          </div>
        )}
        <ModelCard
          name="reference"
          markup={reference}
          markupKeys={markupKeys}
          markupState={markupState}
          setMarkupKeys={setMarkupKeys}
          hasDocument={doc !== undefined}
          scrollState={scrollState}
        />
        {Object.entries(models)
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
              scrollState={scrollState}
            />
          ))}
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
  );
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
    data,
    layout: layoutPatch,
    text: { modelScores, document: doc, reference, model1, model2 },
    pagination: { numPages, page, setPage },
    onSelected,
    onDeselect,
    setHighlightedPoint,
  } = usePlot(plotData, matrix.references, matrix.documents);
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
            <Th loose>Metric</Th>
            {colnames.map((colname) => (
              <Th key={colname} loose center>
                {colname}
              </Th>
            ))}
          </Thead>
          <Tbody>
            {table.map((row, i) => {
              const metric = rownames[i];
              return (
                <Tr key={metric} striped>
                  <Td loose>{metric}</Td>
                  {row.map((isSet, j) => (
                    <Td key={j} loose center>
                      <Checkbox checked={isSet} onChange={() => toggleMetric([i, j])} />
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
          <div>
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
          </div>
          <div>
            {reference !== undefined && (
              <div>
                <div className="flex justify-center">
                  <Pagination page={page} numPages={numPages} setPage={setPage} />
                </div>
                <ExampleDisplay
                  key={Object.keys(modelScores).join(":")}
                  modelScores={modelScores}
                  doc={doc}
                  reference={reference}
                  model1={model1}
                  model2={model2}
                />
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
