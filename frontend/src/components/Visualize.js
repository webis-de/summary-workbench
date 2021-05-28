import React, { useEffect, useMemo, useReducer, useState } from "react";
import { FaInfoCircle, FaTrash } from "react-icons/fa";

import { useKeycode } from "../hooks/keycode";
import { useList } from "../hooks/list";
import { usePagination } from "../hooks/pagination";
import { useSavedVisualizations } from "../hooks/savedVisualizations";
import { computeMarkup } from "../utils/markup";
import { displayMessage } from "../utils/message";
import { Markup } from "./utils/Markup";
import { Accordion, AccordionItem } from "./utils/Accordion";
import { Button } from "./utils/Button";
import { Card, CardBody, CardHeader, CardTitle } from "./utils/Card";
import { ChooseFile, sameLength, useFile } from "./utils/ChooseFile";
import { DeleteButton } from "./utils/DeleteButton";
import { EyeClosed, EyeOpen } from "./utils/Icons";
import { Modal } from "./utils/Modal";
import { Pagination } from "./utils/Pagination";

const ModelModal = ({ isOpen, setIsOpen, models, addModel, otherLines, forceSameLine = false }) => {
  const [name, setName] = useState("");
  const [infoText, setInfoText] = useState(null);
  const [fileName, setFile, lines] = useFile(null);
  const linesAreSame = sameLength([lines, ...otherLines]);

  const close = () => setIsOpen(false);
  const modelIsValid = () => !Object.values(models).some((model) => model.name === name);
  const accept = () => {
    if (!name) {
      setInfoText("no name given");
      return;
    }
    if (fileName === null) {
      setInfoText("no file given");
      return;
    }
    if (forceSameLine && !linesAreSame) {
      setInfoText(`the files has to have exactly ${otherLines[0].length} lines`);
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
        onChange={(e) => setName(e.currentTarget.value)}
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

const ModelList = ({ models, removeModel }) => (
  <ul className="uk-list uk-list-striped uk-list-primary">
    {models.map((name) => (
      <li className="uk-flex uk-flex-between" key={name}>
        <span>{name}</span>
        <DeleteButton onClick={() => removeModel(name)}>
          <FaTrash />
        </DeleteButton>
      </li>
    ))}
  </ul>
);

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
              transform: "translate(-100%, -6%)",
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

const VisualizationCreator = ({ back, addVisualization }) => {
  const [modelModalIsOpen, setModelModalOpen] = useState(false);

  const [docFileName, setDocFile, docFileLines] = useFile(null);
  const [refFileName, setRefFile, refFileLines] = useFile(null);
  const [name, setName] = useState("");

  const [models, addModel, removeModel] = useList();
  const allLines = [refFileLines, docFileLines, ...Object.values(models).map(({ lines }) => lines)];
  const hasInput = docFileName !== null && refFileName !== null;
  const atLeastOneModel = Boolean(Object.keys(models).length);
  const linesAreSame = sameLength(allLines);

  useEffect(() => {
    if (hasInput) setName(`${docFileName}-${refFileName}`);
  }, [hasInput, docFileName, refFileName]);

  let tooltip = null;
  if (!atLeastOneModel) tooltip = "title: add at least one model; pos: right;";
  else if (!linesAreSame) tooltip = "title: not all lines are same; pos: right;";

  return (
    <>
      <div className="uk-flex">
        <div className="uk-flex-column" style={{ display: "inline-flex", minWidth: "300px" }}>
          <Button className="uk-margin-small" onClick={back} variant="primary">
            Back
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
          {hasInput && (
            <>
              <input
                type="text"
                className="uk-input uk-margin-small"
                value={name}
                placeholder="name"
                onChange={(e) => setName(e.currentTarget.value)}
              />
              <Button
                className="uk-margin-small"
                variant="primary"
                onClick={() => setModelModalOpen(true)}
              >
                Add Model
              </Button>

              <Button
                className="uk-margin-small"
                variant="primary"
                onClick={() => {
                  addVisualization(name, {
                    documents: docFileLines,
                    references: refFileLines,
                    models: Object.values(models),
                  });
                  back();
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
          <h3>Models</h3>
          <ModelTable models={models} linesAreSame={linesAreSame} removeModel={removeModel} />
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
    </>
  );
};

const useMarkup = (doc, reference, models) => {
  const [slot, toggleSlot] = useReducer((state, newSlot) => {
    if (state === newSlot) return null;
    return newSlot;
  }, null);
  const [docMarkup, refMarkup] = useMemo(() => {
    switch (slot) {
      case null:
        return [];
      case "reference":
        return computeMarkup(doc, reference);
      default:
        return computeMarkup(doc, models[slot][1]);
    }
  }, [slot, doc, reference, models]);
  return [docMarkup, refMarkup, slot, toggleSlot];
};

const VisualizeContent = ({ doc, reference, models }) => {
  const [docMarkup, refMarkup, slot, toggleSlot] = useMarkup(doc, reference, models);

  const referenceSelected = slot === "reference";
  const ReferenceEye = referenceSelected ? EyeClosed : EyeOpen;

  return (
    <div className="visualization-layout">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Document</CardTitle>
          </CardHeader>
          <CardBody>{docMarkup ? <Markup markups={docMarkup} /> : doc}</CardBody>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="uk-flex uk-flex-between">
                Reference
                <ReferenceEye
                  className="uk-margin-right"
                  style={{ minWidth: "30px" }}
                  onClick={() => toggleSlot("reference")}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardBody>{referenceSelected ? <Markup markups={refMarkup} /> : reference}</CardBody>
        </Card>
        {models.map(([name, modelLine], i) => {
          const modelSelected = slot === i;
          const ModelEye = modelSelected ? EyeClosed : EyeOpen;
          return (
            <Card key={name} style={{ flexBasis: "50%" }}>
              <CardHeader>
                <CardTitle>
                  <div className="uk-flex uk-flex-between">
                    {name}
                    <ModelEye
                      className="uk-margin-right"
                      style={{ minWidth: "30px" }}
                      onClick={() => toggleSlot(i)}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardBody>{modelSelected ? <Markup markups={refMarkup} /> : modelLine}</CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const Visualize = ({ visualization, clear }) => {
  const { name, documents, references, models } = visualization;

  const [page, setPage, size, , numItems] = usePagination(documents.length, 1, 1);
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
          Back
        </Button>
        <Pagination
          activePage={page}
          size={size}
          numItems={numItems}
          pageRange={5}
          onChange={setPage}
        />
      </div>
      <h3 style={{ marginTop: "10px" }}>{name}</h3>
      <VisualizeContent
        doc={documents[linesIndex]}
        reference={references[linesIndex]}
        models={models.map((model) => [model.name, model.lines[linesIndex]])}
      />
    </div>
  );
};

const AddModelDialog = ({ getVisualizationData, setIsOpen, addModel }) => {
  const { models, documents } = getVisualizationData();
  return (
    <ModelModal
      isOpen
      models={models}
      addModel={addModel}
      setIsOpen={setIsOpen}
      otherLines={[documents]}
      forceSameLine
    />
  );
};

const AddModel = ({ getVisualizationData, addModel }) => {
  const [modelModalIsOpen, setModelModalOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setModelModalOpen(true)}>Add Model</Button>
      {modelModalIsOpen && (
        <AddModelDialog
          getVisualizationData={getVisualizationData}
          setIsOpen={setModelModalOpen}
          addModel={addModel}
        />
      )}
    </>
  );
};

const VisualizationOverview = () => {
  const {
    visualizationIDs,
    addVisualization,
    deleteVisualization,
    getVisualizationModels,
    getVisualizationData,
  } = useSavedVisualizations();
  const [visID, setVisID] = useState(null);
  const [showOverview, setShowOverview] = useState(true);

  if (visID !== null)
    return (
      <div className="uk-container">
        <Visualize visualization={getVisualizationData(visID)} clear={() => setVisID(null)} />
      </div>
    );
  return (
    <div className="uk-container">
      {showOverview ? (
        <div className="uk-flex uk-flex-top">
          <Button onClick={() => setShowOverview((v) => !v)} variant="primary">
            Create Visualization
          </Button>
          <div style={{ width: "20px" }} />
          <Accordion>
            {visualizationIDs.map((ID) => {
              const models = getVisualizationModels(ID);
              const addModel = (model) => {
                const v = getVisualizationData(ID);
                v.models = [...v.models, model];
                addVisualization(ID, v, true);
              };
              return (
                <AccordionItem
                  key={ID}
                  text={ID}
                  buttons={[["visualize", () => setVisID(ID)]]}
                  remove={() => deleteVisualization(ID)}
                >
                  <div className="uk-flex uk-flex-between uk-flex-middle">
                    <h3 style={{margin: 0}}>Models</h3>
                    <AddModel
                      getVisualizationData={() => getVisualizationData(ID)}
                      addModel={addModel}
                    />
                  </div>
                  <ModelList
                    models={models}
                    removeModel={(modelName) => {
                      const v = getVisualizationData(ID);
                      const newModels = v.models.filter(({ name }) => name !== modelName);
                      if (!newModels.length) {
                        displayMessage("can not remove last model");
                        return;
                      }
                      v.models = newModels;
                      addVisualization(ID, v, true);
                    }}
                  />
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      ) : (
        <VisualizationCreator
          back={() => setShowOverview((v) => !v)}
          addVisualization={(ID, data) => {
            addVisualization(ID, data);
            setVisID(ID);
          }}
        />
      )}
    </div>
  );
};

export { VisualizationOverview };
