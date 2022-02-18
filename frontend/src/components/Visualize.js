import React, { useMemo, useReducer, useState } from "react";
import { FaInfoCircle, FaPlus, FaTimes } from "react-icons/fa";
import { useKey } from "react-use";

import { useMarkup } from "../hooks/markup";
import { useVisualizations } from "../hooks/visualizations";
import { Accordion, AccordionItem } from "./utils/Accordion";
import { Button } from "./utils/Button";
import { Card, CardContent, CardHead } from "./utils/Card";
import { ChooseFile, useFile } from "./utils/ChooseFile";
import { DeleteButton } from "./utils/DeleteButton";
import { EyeClosed, EyeOpen } from "./utils/Icons";
import { CenterLoading } from "./utils/Loading";
import { Markup } from "./utils/Markup";
import { Modal } from "./utils/Modal";
import { Pagination, usePagination } from "./utils/Pagination";
import { HeadingBig } from "./utils/Text";

const ModelModal = ({ close, addModel, length }) => {
  const [name, setName] = useState("");
  const [infoText, setInfoText] = useState(null);
  const [fileName, setFile, lines] = useFile(null);
  const rightLength = lines ? lines.length === length : true;

  const accept = async () => {
    const cleanName = name.trim();
    if (!cleanName) setInfoText("no name given");
    else if (fileName === null) setInfoText("no file given");
    else if (!rightLength) setInfoText(`the files has to have exactly ${length} lines`);
    else if (!(await addModel({ name: cleanName, lines })))
      setInfoText(`name '${cleanName}' is already taken`);
    else close();
  };

  useKey("Enter", accept);

  return (
    <Modal isOpen onRequestClose={close}>
      <input
        className="uk-input align-center"
        type="text"
        value={name}
        placeholder="name"
        autoFocus
        onChange={(e) => setName(e.currentTarget.value)}
      />
      <ChooseFile
        className="uk-margin-top"
        kind="model file"
        fileName={fileName}
        setFile={setFile}
        lines={lines}
        linesAreSame={rightLength}
      />
      <div className="uk-margin-top uk-text-primary">
        <FaInfoCircle /> the model file has to have {length} lines
      </div>
      {infoText && (
        <div className="uk-margin-top uk-text-primary uk-text-danger">
          <FaInfoCircle /> {infoText}
        </div>
      )}
      <div className="uk-margin" style={{ float: "right" }}>
        <Button variant="secondary" onClick={close}>
          cancel
        </Button>
        <Button variant="primary" onClick={accept}>
          add
        </Button>
      </div>
    </Modal>
  );
};

const ModelBadge = ({ name, removeModel }) => (
  <div className="uk-flex" style={{ border: "1px solid", padding: "5px 10px" }}>
    <span style={{ marginRight: "10px" }}>{name}</span>
    <a
      href="/#"
      style={{ display: "flex", marginLeft: "3px" }}
      onClick={(e) => {
        e.preventDefault();
        removeModel(name);
      }}
    >
      <FaTimes style={{ minWidth: "15px", color: "black" }} />
    </a>
  </div>
);

const ModelList = ({ models, removeModel }) => (
  <div className="margin-between-10 uk-flex uk-flex-wrap">
    {models.map(({ name }) => (
      <ModelBadge key={name} name={name} removeModel={removeModel} />
    ))}
  </div>
);

const VisualizeContent = ({ doc, models }) => {
  const [slot, toggleSlot] = useReducer(
    (state, newSlot) => (state !== newSlot ? newSlot : null),
    null
  );
  const ref = useMemo(() => {
    if (slot === null) return null;
    return models[slot][1];
  }, [slot, models]);

  const [docMarkup, refMarkup] = useMarkup(doc, ref);
  const markupState = useState(null);

  return (
    <div className="visualization-layout margin-between-10">
      <div>
        <Card full>
          <CardHead>
            <HeadingBig>Document</HeadingBig>
          </CardHead>
          <CardContent>
            {docMarkup ? <Markup markups={docMarkup} markupState={markupState} /> : doc}
          </CardContent>
        </Card>
      </div>
      <div>
        {models.map(([name, modelLine], i) => {
          const modelSelected = slot === i;
          const ModelEye = modelSelected ? EyeClosed : EyeOpen;
          return (
            <Card key={name} style={{ flexBasis: "50%" }}>
              <CardHead>
                <div className="flex justify-between">
                  <HeadingBig>{name}</HeadingBig>
                  <ModelEye
                    className="uk-margin-right"
                    style={{ minWidth: "30px" }}
                    onClick={() => toggleSlot(i)}
                  />
                </div>
              </CardHead>
              <CardContent>
                {modelSelected ? (
                  <Markup markups={refMarkup} markupState={markupState} />
                ) : (
                  modelLine
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const Visualize = ({ visualization, clear }) => {
  const { name, documents, models } = visualization;

  const { numPages, page, setPage, size, setSize } = usePagination(documents.length, 1, 1);
  const linesIndex = page - 1;

  useKey("Escape", clear);
  useKey("ArrowLeft", () => setPage(page - 1));
  useKey("ArrowRight", () => setPage(page + 1));

  return (
    <div>
      <Button onClick={clear} variant="primary" style={{ marginRight: "10vw" }}>
        Back
      </Button>
      <div className="flex justify-center">
        <Pagination
          page={page}
          size={size}
          numPages={numPages}
          setPage={setPage}
          setSize={setSize}
        />
      </div>
      <h3 style={{ marginTop: "10px" }}>{name}</h3>
      <VisualizeContent
        doc={documents[linesIndex]}
        models={models.map((model) => [model.name, model.lines[linesIndex]])}
      />
    </div>
  );
};

const AddModel = ({ length, addModel }) => {
  const [modelModalIsOpen, setModelModalOpen] = useState(false);
  return (
    <div>
      <Button
        className="uk-flex uk-flex-middle uk-flex-center"
        variant="primary"
        style={{ height: "30px", width: "30px", padding: "0px" }}
        onClick={() => setModelModalOpen(true)}
      >
        <FaPlus />
      </Button>
      {modelModalIsOpen && (
        <ModelModal close={() => setModelModalOpen(false)} addModel={addModel} length={length} />
      )}
    </div>
  );
};

const VisualizationItem = ({ visualization, addModel, removeModel, visualize, remove }) => (
  <AccordionItem
    text={visualization.id}
    infoText={visualization.models.length ? null : "a model needs to be added (click to expand)"}
    buttons={[["visualize", visualize]]}
    badges={[`${visualization.documents.length} lines`, `${visualization.models.length} models`]}
  >
    <div className="uk-flex uk-flex-between uk-flex-middle">
      <div
        className="uk-flex uk-flex-middle"
        style={{ alignContent: "center", alignItems: "center" }}
      >
        <h3 style={{ margin: 0, marginRight: "10px" }}>Models</h3>
        <AddModel length={visualization.documents.length} addModel={addModel} />
      </div>
      <DeleteButton onClick={remove} />
    </div>
    <div style={{ padding: "10px" }}>
      <ModelList models={visualization.models} removeModel={removeModel} />
    </div>
  </AccordionItem>
);

const AddVisualizationModal = ({ close, create }) => {
  const [name, setName] = useState("");
  const [infoText, setInfoText] = useState(null);
  const [fileName, setFile, lines] = useFile(null);

  const accept = async () => {
    const cleanName = name.trim();
    if (!cleanName) setInfoText("no name given");
    if (fileName === null) setInfoText("upload a document file");
    else {
      try {
        await create(cleanName, lines);
        close();
      } catch ({ message }) {
        if (message === "NOID") setInfoText("no name given");
        else if (message === "TAKEN") setInfoText(`name '${cleanName}' is already taken`);
        else setInfoText(`error: ${message}`);
      }
    }
  };

  useKey("Enter", accept);

  return (
    <Modal isOpen onRequestClose={close}>
      <input
        className="uk-input align-center"
        type="text"
        value={name}
        placeholder="name"
        autoFocus
        onChange={(e) => setName(e.currentTarget.value)}
      />
      <ChooseFile
        className="uk-margin-top"
        kind="document file"
        fileName={fileName}
        setFile={setFile}
        lines={lines}
      />
      {infoText && (
        <div className="uk-margin-top uk-text-danger">
          <FaInfoCircle /> {infoText}
        </div>
      )}
      <div className="uk-margin" style={{ float: "right" }}>
        <Button variant="secondary" onClick={close}>
          cancel
        </Button>
        <Button variant="primary" onClick={accept}>
          add
        </Button>
      </div>
    </Modal>
  );
};

const VisualizationView = () => {
  const vis = useVisualizations();

  const [currVisualization, setCurrVisualization] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const openModal = () => setModalIsOpen(true);

  if (currVisualization !== null)
    return <Visualize visualization={currVisualization} clear={() => setCurrVisualization(null)} />;
  if (!vis.visualizations) return <CenterLoading />;

  return (
    <div>
      <div className="uk-flex uk-flex-center">
        <Button variant="primary" onClick={openModal}>
          Create Visualization
        </Button>
      </div>
      {modalIsOpen && (
        <AddVisualizationModal close={() => setModalIsOpen(false)} create={vis.create} />
      )}
      <div className="uk-margin" />
      <Accordion>
        {vis.visualizations.map((visualization) => {
          const { id } = visualization;
          const addModel = (model) => vis.addModel(id, model);
          const removeModel = (modelName) => vis.delModel(id, modelName);
          const visualize = () => setCurrVisualization(visualization);
          const remove = () => vis.remove(id);
          return (
            <VisualizationItem
              key={id}
              visualization={visualization}
              addModel={addModel}
              removeModel={removeModel}
              visualize={visualize}
              remove={remove}
            />
          );
        })}
      </Accordion>
    </div>
  );
};

export { VisualizationView };
