import React, { useEffect, useReducer, useState } from "react";
import { FaInfoCircle, FaTrash } from "react-icons/fa";

import { useKeycode } from "../hooks/keycode";
import { useList } from "../hooks/list";
import { usePagination } from "../hooks/pagination";
import { markup } from "../utils/fragcolors";
import { Markup } from "./Markup";
import { Accordion, AccordionItem } from "./utils/Accordion";
import { Checkboxes, LikertScale, RadioButtons, ShortText } from "./utils/Annotations";
import { Button } from "./utils/Button";
import { Card } from "./utils/Card";
import { ChooseFile, sameLength, useFile } from "./utils/ChooseFile";
import { DeleteButton } from "./utils/DeleteButton";
import { Modal } from "./utils/Modal";
import { Pagination } from "./utils/Pagination.js";
import { TabContent, TabHead, TabItem } from "./utils/Tabs";

const ModelModal = ({ isOpen, setIsOpen, models, addModel, otherLines }) => {
  const [name, setName] = useState("");
  const [infoText, setInfoText] = useState(null);
  const [fileName, setFile, lines] = useFile(null);
  const linesAreSame = sameLength([lines, ...otherLines]);

  const close = () => {
    setIsOpen(false);
  };
  const modelIsValid = () => {
    return !Object.values(models).some((model) => model.name === name);
  };
  const accept = () => {
    if (!name) {
      setInfoText("no name given");
      return;
    }
    if (fileName === null) {
      setInfoText("no file given");
      return;
    }
    if (modelIsValid()) {
      addModel({ name, lines });
      close();
    } else {
      setInfoText(`name '${name}' is already taken`);
    }
  };
  useKeycode([13], accept, isOpen);

  return (
    <Modal isOpen={isOpen} onRequestClose={close}>
      <input
        className="uk-input"
        type="text"
        value={name}
        placeholder="name"
        autoFocus
        onChange={(e) => setName(e.target.value)}
      />
      <ChooseFile
        className="uk-margin-top"
        kind="Model"
        name="Model"
        fileName={fileName}
        setFile={setFile}
        lines={lines}
        linesAreSame={linesAreSame}
      />
      {infoText && (
        <div className="uk-margin-top uk-text-primary">
          <FaInfoCircle /> {infoText}
        </div>
      )}
      <div className="uk-margin" style={{ float: "right" }}>
        <button className="uk-button uk-button-secondary" onClick={close}>
          cancel
        </button>
        <button className="uk-button uk-button-primary" onClick={accept}>
          add
        </button>
      </div>
    </Modal>
  );
};

const optionTypes = ["checkboxes", "radio buttons"];

const AnnotationDesigner = ({ type, options, addOption, removeOption, alterOption }) => {
  if (optionTypes.includes(type)) {
    return (
      <div className="uk-margin-top">
        <Button onClick={() => addOption("")}>Add Option</Button>
        {Object.entries(options).map(([key, option]) => (
          <div key={key} className="uk-flex uk-margin-top">
            <input
              className="uk-input"
              value={option}
              onChange={(e) => alterOption(key, e.target.value)}
              placeholder="option value"
            />
            <DeleteButton onClick={() => removeOption(key)} />
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const annotationTypes = {
  "short text": ShortText,
  "likert scale": LikertScale,
  checkboxes: Checkboxes,
  "radio buttons": RadioButtons,
};

const getAnnotation = (type, options) => {
  const Type = annotationTypes[type];
  return <Type setValue={() => {}} options={options} />;
};

const Annotation = ({ question, type, options }) => {
  return (
    <>
      <fieldset
        style={{
          whiteSpace: "pre-wrap",
          minHeight: "1.25em",
          lineHeight: "1.25",
          marginBottom: "10px",
          borderRadius: "3px",
        }}
      >
        <legend>{question}</legend>
        <div className="uk-flex uk-flex-center">{getAnnotation(type, options)}</div>
      </fieldset>
    </>
  );
};

const AnnotationPreview = ({ question, type, options }) => (
  <div>
    <h5>Preview</h5>
    <Annotation question={question} type={type} options={options} />
  </div>
);

const answerTypes = ["short text", "likert scale", "checkboxes", "radio buttons"];

const AnnotationModal = ({ isOpen, setIsOpen, addAnnotation }) => {
  const [question, setQuestion] = useState("");
  const [infoText, setInfoText] = useState(null);
  const [options, addOption, removeOption, alterOption] = useList();
  const [type, setType] = useState("");

  const close = () => {
    setIsOpen(false);
  };

  const accept = () => {
    if (!question) {
      setInfoText("no question given");
      return;
    }
    if (!type) {
      setInfoText("no answer type selected");
      return;
    }
    const annotation = { question, type };
    if (optionTypes.includes(type)) {
      const givenOptions = Object.values(options);
      if (!givenOptions.length) {
        setInfoText("provide at least one option");
        return;
      }
      if (givenOptions.some((option) => !option.length)) {
        setInfoText("some option is empty");
        return;
      }
      annotation.options = options;
    }
    addAnnotation(annotation);
    close();
  };
  useKeycode([13], accept, isOpen);

  return (
    <Modal isOpen={isOpen} onRequestClose={close}>
      <input
        className="uk-input"
        type="text"
        value={question}
        placeholder="question"
        autoFocus
        onChange={(e) => setQuestion(e.target.value)}
      />
      <select
        value={type}
        className="uk-select uk-margin-top"
        name="answerType"
        onChange={(e) => setType(e.target.value)}
      >
        <option value="" disabled selected hidden>
          answer type
        </option>
        {answerTypes.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {Boolean(type) && (
        <>
          <AnnotationDesigner
            type={type}
            options={options}
            addOption={addOption}
            removeOption={removeOption}
            alterOption={alterOption}
          />
          <div className="uk-margin-top" />
          <AnnotationPreview question={question} type={type} options={options} />
        </>
      )}
      {infoText && (
        <div className="uk-margin-top uk-text-primary">
          <FaInfoCircle /> {infoText}
        </div>
      )}
      <div className="uk-margin" style={{ float: "right" }}>
        <button className="uk-button uk-button-secondary" onClick={close}>
          cancel
        </button>
        <button className="uk-button uk-button-primary" onClick={accept}>
          add
        </button>
      </div>
    </Modal>
  );
};

const ModelTable = ({ models, linesAreSame = true, removeModel }) => (
  <table className="uk-table uk-table-divider uk-table-small uk-table-middle">
    <thead>
      <tr>
        <th>name</th>
        <th>lines</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(models).map(([key, model]) => (
        <tr key={key} style={{ position: "relative" }}>
          <td>{model.name}</td>
          <td>
            <span
              style={{
                padding: "5px 10px",
                background: !linesAreSame ? "#f0506e" : null,
              }}
            >
              {model.lines.length}
            </span>
          </td>
          <td
            style={{
              position: "absolute",
              top: "50%",
              transform: "translate(-100%, -50%)",
            }}
          >
            {removeModel && (
              <DeleteButton onClick={() => removeModel(key)}>
                <FaTrash />
              </DeleteButton>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const AnnotationTable = ({ annotations, removeAnnotation }) => (
  <Accordion>
    {Object.entries(annotations).map(([key, { question, type, options }]) => (
      <AccordionItem
        key={key}
        text={question}
        badges={[type]}
        remove={removeAnnotation && (() => removeAnnotation(key))}
      >
        <AnnotationPreview question={question} type={type} options={options} />
      </AccordionItem>
    ))}
  </Accordion>
);

const VisualizationCreator = ({ toggleOverview, addVisualization }) => {
  const [modelModalIsOpen, setModelModalOpen] = useState(false);
  const [annotationModalIsOpen, setAnnotationModalOpen] = useState(false);

  const [docFileName, setDocFile, docFileLines] = useFile(null);
  const [refFileName, setRefFile, refFileLines] = useFile(null);

  const [models, addModel, removeModel] = useList();
  const allLines = [refFileLines, docFileLines, ...Object.values(models).map(({ lines }) => lines)];
  const atLeastOneModel = Boolean(Object.keys(models).length);
  const linesAreSame = sameLength(allLines);
  const [annotations, addAnnotation, removeAnnotation] = useList();

  let tooltip = null;
  if (!atLeastOneModel) {
    tooltip = "title: add at least one model; pos: right;";
  } else if (!linesAreSame) {
    tooltip = "title: not all lines are same; pos: right;";
  }

  return (
    <>
      <div className="uk-flex">
        <div className="uk-flex-column" style={{ display: "inline-flex", minWidth: "300px" }}>
          <Button className="uk-margin-small" onClick={() => toggleOverview()} variant="primary">
            Abort
          </Button>
          <ChooseFile
            className="uk-margin-small"
            kind="Documents"
            name="Documents"
            fileName={docFileName}
            setFile={setDocFile}
            lines={docFileLines}
            linesAreSame={linesAreSame}
          />

          <ChooseFile
            className="uk-margin-small"
            kind="References"
            name="References"
            fileName={refFileName}
            setFile={setRefFile}
            lines={refFileLines}
            linesAreSame={linesAreSame}
          />
          {docFileName !== null && refFileName !== null && (
            <>
              <Button
                className="uk-margin-small"
                variant="primary"
                onClick={() => setModelModalOpen(true)}
              >
                Add Model
              </Button>

              <Button
                variant="primary"
                className="uk-margin-small"
                onClick={() => setAnnotationModalOpen(true)}
              >
                Add Annotation
              </Button>

              <Button
                className="uk-margin-small"
                variant="primary"
                onClick={() => {
                  addVisualization({
                    documents: { lines: docFileLines, name: docFileName },
                    references: { lines: refFileLines, name: refFileName },
                    models: Object.values(models),
                    annotations: Object.values(annotations),
                  });
                  toggleOverview();
                }}
                disabled={!atLeastOneModel || !linesAreSame}
                data-uk-tooltip={tooltip}
              >
                Save
              </Button>
            </>
          )}
        </div>

        <div style={{ width: "20px" }} />
        <div className="uk-flex-column" style={{ flexGrow: 1 }}>
          <TabHead tabs={["Models", "Annotations"]} />
          <TabContent>
            <TabItem>
              <ModelTable models={models} linesAreSame={linesAreSame} removeModel={removeModel} />
            </TabItem>
            <TabItem>
              <AnnotationTable annotations={annotations} removeAnnotation={removeAnnotation} />
            </TabItem>
          </TabContent>
        </div>
      </div>

      {modelModalIsOpen && (
        <ModelModal
          isOpen={modelModalIsOpen}
          models={models}
          addModel={addModel}
          setIsOpen={setModelModalOpen}
          otherLines={allLines}
        />
      )}
      {annotationModalIsOpen && (
        <AnnotationModal
          isOpen={annotationModalIsOpen}
          setIsOpen={setAnnotationModalOpen}
          addAnnotation={addAnnotation}
        />
      )}
    </>
  );
};

const Annotations = ({ annotations }) => {
  return (
    <>
      {annotations.map(({ question, type, options }, i) => (
        <Annotation key={i} question={question} type={type} options={options} />
      ))}
    </>
  );
};

const useMarkup = (doc, ref = null) => {
  const [reference, toggleReference] = useReducer(
    (oldState, reference) => (Object.is(oldState, reference) ? null : reference),
    ref
  );
  const [docMarkup, setDocMarkup] = useState(null);
  const [refMarkup, setRefMarkup] = useState(null);
  useEffect(() => {
    if (reference) {
      const [dMarkup, rMarkup] = markup(doc, reference);
      setDocMarkup(dMarkup);
      setRefMarkup(rMarkup);
    } else {
      setDocMarkup(null);
      setRefMarkup(null);
    }
  }, [reference]);
  return [docMarkup, refMarkup, refMarkup ? reference : null, toggleReference];
};

const VisualizeContent = ({ doc, reference, annotations, models }) => {
  const [docMarkup, refMarkup, currentReference, toggleReference] = useMarkup(doc);

  return (
    <div className="uk-flex uk-flex-top">
      <div style={{ flexBasis: "50%" }}>
        <Card title={<div className="card-title">Document</div>}>
          {docMarkup ? <Markup markupedText={docMarkup} /> : doc}
        </Card>
        <h3 className="uk-margin-top">Annotations</h3>
        <Annotations annotations={annotations} />
      </div>
      <div style={{ margin: "10px" }} />
      <div style={{ flexBasis: "50%" }}>
        <Card
          style={{ flexBasis: "50%" }}
          title={
            <div className="card-title uk-flex uk-flex-between">
              reference
              <Button
                className="uk-margin-right"
                variant={reference === currentReference ? "secondary" : "primary"}
                size="small"
                onClick={() => toggleReference(reference)}
              >
                {reference === currentReference ? "hide overlap" : "show overlap"}
              </Button>
            </div>
          }
        >
          {reference === currentReference ? <Markup markupedText={refMarkup} /> : reference}
        </Card>
        {models.map(([name, line]) => (
          <Card
            key={name}
            style={{ flexBasis: "50%" }}
            title={
              <div className="card-title uk-flex uk-flex-between">
                {name}
                <Button
                  className="uk-margin-right"
                  variant={line === currentReference ? "secondary" : "primary"}
                  size="small"
                  onClick={() => toggleReference(line)}
                >
                  {line === currentReference ? "hide overlap" : "show overlap"}
                </Button>
              </div>
            }
          >
            {line === currentReference ? <Markup markupedText={refMarkup} /> : line}
          </Card>
        ))}
      </div>
    </div>
  );
};

const Visualize = ({ visualization, clear }) => {
  const { documents, references, models, annotations } = visualization;
  const title = `${documents.name}-${references.name}`;
  const [page, setPage, size, , numItems] = usePagination(documents.lines.length, 1, 1);
  const linesIndex = page - 1;
  useKeycode([37, 39], (code) => {
    if (code === 37) {
      setPage(page - 1);
    } else if (code === 39) {
      setPage(page + 1);
    }
  });
  return (
    <div>
      <div className="uk-flex uk-flex-middle">
        <Button onClick={clear} variant="primary" style={{ marginRight: "10vw" }}>
          Abort
        </Button>
        <Pagination
          activePage={page}
          size={size}
          numItems={numItems}
          pageRange={5}
          onChange={setPage}
        />
      </div>
      <h3 style={{ marginTop: "10px" }}>{title}</h3>
      <VisualizeContent
        key={linesIndex}
        doc={documents.lines[linesIndex]}
        reference={references.lines[linesIndex]}
        annotations={annotations}
        models={models.map(({ name, lines }) => [name, lines[linesIndex]])}
      />
    </div>
  );
};

const VisualizationOverview = () => {
  const [visualizations, addVisualization, removeVisualization] = useList();
  const [showOverview, toggleShowOverview] = useReducer((e) => !e, true);
  const [visualize, setVisualize] = useState(null);
  useEffect(
    () =>
      addVisualization({
        documents: { lines: ["hello world"], name: "test" },
        references: { lines: ["hello world"], name: "test" },
        models: [{ name: "test2", lines: ["hello"] }],
        annotations: [{ question: "hello", type: "likert scale" }],
      }),
    []
  );

  return (
    <div className="uk-container">
      {visualize ? (
        <Visualize visualization={visualize} clear={() => setVisualize(null)} />
      ) : showOverview ? (
        <div className="uk-flex uk-flex-top">
          <Button onClick={() => toggleShowOverview()} variant="primary">
            Create Visualization
          </Button>
          <div style={{ width: "20px" }} />
          <Accordion>
            {Object.entries(visualizations).map(([key, visualization]) => {
              const { documents, references, models, annotations } = visualization;
              return (
                <AccordionItem
                  key={key}
                  text={`${documents.name}-${references.name}`}
                  badges={[`${documents.lines.length} examples`]}
                  buttons={[["visualize", () => setVisualize(visualization)]]}
                  remove={() => removeVisualization(key)}
                >
                  <div className="uk-flex-column" style={{ flexGrow: 1 }}>
                    <TabHead tabs={["Models", "Annotations"]} />
                    <TabContent>
                      <TabItem>
                        <ModelTable models={models} />
                      </TabItem>
                      <TabItem>
                        <AnnotationTable annotations={annotations} />
                      </TabItem>
                    </TabContent>
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      ) : (
        <VisualizationCreator
          toggleOverview={toggleShowOverview}
          addVisualization={addVisualization}
        />
      )}
    </div>
  );
};

export { VisualizationOverview };
