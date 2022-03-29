import { useContext, useMemo, useReducer, useRef, useState } from "react";
import { FaCheck, FaRegCopy } from "react-icons/fa";
import Plot from "react-plotly.js";
import { useKey, useToggle } from "react-use";

import { HoverContext } from "../contexts/HoverContext";
import { useMarkup } from "../hooks/markup";
import { arrayEqual, mapObject } from "../utils/common";
import formatters from "../utils/export";
import { range } from "../utils/python";
import { Button } from "./utils/Button";
import { Card, CardContent, CardHead } from "./utils/Card";
import { Input } from "./utils/Form";
import { EyeClosed, EyeOpen } from "./utils/Icons";
import { Markup } from "./utils/Markup";
import { Pagination, usePagination } from "./utils/Pagination";
import { ButtonGroup, RadioButton, RadioGroup } from "./utils/Radio";
import { Table, TableWrapper, Tbody, Td, Th, Thead, Tr } from "./utils/Table";
import { Pill, TabContent, TabHead, TabPanel, Tabs } from "./utils/Tabs";
import { HeadingSemiBig, HeadingSmall } from "./utils/Text";
import { Toggle } from "./utils/Toggle";
import { Tooltip } from "./utils/Tooltip";

const CopyToClipboardButton = ({ text }) => {
  const [saved, setSaved] = useState(false);
  const timeout = useRef();
  const onClick = () => {
    navigator.clipboard.writeText(text);
    setSaved(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setSaved(false), 1000);
  };
  if (saved)
    return (
      <Button variant="success">
        <FaCheck />
      </Button>
    );
  return (
    <Button appearance="fill" variant="primary" onClick={onClick}>
      <FaRegCopy />
    </Button>
  );
};

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

const ScoreTable = ({ rownames, colnames, table }) => {
  const [format, setFormat] = useState(null);
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
      {format && (
        <ExportPreview format={format} rownames={rownames} colnames={colnames} table={table} />
      )}
    </div>
  );
};

const isMarkup = (markup) => !(typeof markup === "string");

const ToggleOverlap = ({ show, toggle }) => {
  const Icon = show ? EyeOpen : EyeClosed;

  return (
    <Tooltip text={"Show/Hide Agreement"}>
      <Icon className="w-7 h-7" onClick={toggle} />
    </Tooltip>
  );
};

const toMarkup = (markup, markupState) =>
  isMarkup(markup) ? (
    <Markup markups={markup} markupState={markupState} />
  ) : (
    <div className="leading-[23px]">{markup}</div>
  );

const ModelCard = ({ name, markup, markupState, toggle }) => (
  <Card full key={name}>
    <CardHead>
      <HeadingSemiBig>{name}</HeadingSemiBig>
      <ToggleOverlap show={!isMarkup(markup)} toggle={toggle} />
    </CardHead>
    <CardContent>{toMarkup(markup, markupState)}</CardContent>
  </Card>
);

class MarkupMatrix {
  constructor(calculation) {
    const { documents, references, modeltexts } = calculation;
    const models = { reference: references, ...modeltexts };
    this.length = documents.length;
    this.documents = documents;
    this.models = models;
  }

  getPair(index, model) {
    return [this.documents[index], this.models[model][index]];
  }

  get(index, docMarkup, modelMarkup) {
    const doc = docMarkup || this.documents[index];
    const models = mapObject(this.models, (e) => e[index]);
    if (modelMarkup) {
      const [name, markup] = modelMarkup;
      models[name] = markup;
    }
    return [doc, models];
  }
}

const Visualize = ({ calculation }) => {
  const matrix = useMemo(() => new MarkupMatrix(calculation), [calculation]);
  const { numPages, page, setPage } = usePagination(matrix.length, 1, 1);

  const hovered = useContext(HoverContext);
  useKey("ArrowLeft", () => hovered && setPage((old) => old - 1), {}, [hovered]);
  useKey("ArrowRight", () => hovered && setPage((old) => old + 1), {}, [hovered]);

  const [slot, toggleSlot] = useReducer(
    (state, newSlot) => (state !== newSlot ? newSlot : null),
    null
  );

  const index = page - 1;
  const [doc, model] = slot !== null ? matrix.getPair(index, slot) : [];

  const [docMarkup, _modelMarkup] = useMarkup(doc, model);
  const modelMarkup = _modelMarkup && [slot, _modelMarkup];

  const markupState = useState(null);
  const [docApplied, { reference, ...models }] = matrix.get(index, docMarkup, modelMarkup);

  return (
    <div>
      <div className="pb-3 flex justify-center">
        <Pagination page={page} numPages={numPages} setPage={setPage} />
      </div>
      <div className="flex items-top gap-3">
        <div className="basis-[45%]">
          <div>
            <Card full>
              <CardHead>
                <HeadingSemiBig>Document</HeadingSemiBig>
              </CardHead>
              <CardContent>{toMarkup(docApplied, markupState)}</CardContent>
            </Card>
          </div>
        </div>
        <div className="basis-[55%]">
          <div className="flex flex-col gap-3">
            {[["reference", reference], ...Object.entries(models).sort()].map(([name, markup]) => (
              <ModelCard
                key={name}
                name={name}
                markup={markup}
                markupState={markupState}
                toggle={() => toggleSlot(name)}
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
    const { references, modeltexts, scores, columns, rows } = calculation;
    this.columns = columns;
    this.rows = rows;
    this.models = modeltexts;
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

const Plotter = ({ calculation }) => {
  const matrix = useMemo(() => new PlotMatrix(calculation), [calculation]);
  const [selectedMetrics, toggleMetric] = useReducer((oldState, value) => {
    const newState = oldState.filter((arr) => !arrayEqual(arr, value));
    if (oldState.length !== newState.length) return newState;
    return [...newState.slice(-1), value];
  }, []);
  const { colnames, rownames, table, plotData } = useMemo(
    () => matrix.get(selectedMetrics),
    [selectedMetrics]
  );
  const [x, y] = plotData;
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
                <Tr key={metric} hover striped>
                  <Td loose>{metric}</Td>
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
      <div className="grid grid-cols-2 py-4 px-2">
        <div>test</div>
        <div className="border border-black">
          <Plot
            className="w-full min-h-[500px]"
            data={[
              {
                x: x.scores,
                y: y.scores,
                // text: [],
                // hoverinfo: "text",
                // customdata:
                type: "scatter",
                mode: "markers",
                hoverlabel: { bgcolor: "black" },
                selected: { marker: { color: "orange", opacity: 1 } },
                unselected: { marker: { color: "blue", opacity: 1 } },
                marker: { color: "blue" },
              },
            ]}
            layout={{
              xaxis: {
                title: x.label,
              },
              yaxis: {
                title: y.label,
              },
              dragmode: "select",
              autosize: true,
              margin: {
                t: 20,
                r: 20,
                l: 60,
                b: 60,
              },
            }}
            config={{
              responsive: true,
            }}
            onSelected={(e) => console.log(e)}
          />
        </div>
      </div>
    </div>
  );
};

const ScoreWorkbench = ({ calculation, RightToken }) => {
  const { rows, columns, table } = calculation;
  return (
    <div>
      <Tabs>
        <div className="mb-5 flex items-center justify-between">
          <TabHead>
            <Pill>Scores</Pill>
            <Pill>Visualize Overlap</Pill>
            <Pill>Plotter</Pill>
          </TabHead>
          {RightToken}
        </div>
        <TabContent>
          <TabPanel>
            <ScoreTable rownames={rows} colnames={columns} table={table} />
          </TabPanel>
          <TabPanel>
            <Visualize calculation={calculation} />
          </TabPanel>
          <TabPanel>
            <Plotter calculation={calculation} />
          </TabPanel>
        </TabContent>
      </Tabs>
    </div>
  );
};

export { ScoreWorkbench };
