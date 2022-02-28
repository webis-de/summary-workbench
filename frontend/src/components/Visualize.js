import React, { useMemo, useReducer, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useKey } from "react-use";

import { useMarkup } from "../hooks/markup";
import { useVisualizations } from "../hooks/visualizations";
import { Badge, BadgeGroup } from "./utils/Badge";
import { Button, DeleteButton } from "./utils/Button";
import { Card, CardContent, CardHead } from "./utils/Card";
import { ChooseFile, useFile } from "./utils/ChooseFile";
import { Disclosure, DisclosureContent, DisclosureToggle } from "./utils/Disclosure";
import { Input } from "./utils/Form";
import { EyeClosed, EyeOpen } from "./utils/Icons";
import { CenterLoading } from "./utils/Loading";
import { Markup } from "./utils/Markup";
import { Modal } from "./utils/Modal";
import { Pagination, usePagination } from "./utils/Pagination";
import { HeadingBig, HeadingMedium, Hint } from "./utils/Text";

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
      <Input value={name} placeholder="name" onChange={(e) => setName(e.currentTarget.value)} />
      <ChooseFile
        kind="model file"
        fileName={fileName}
        setFile={setFile}
        lines={lines}
        linesAreSame={rightLength}
      />
      <Hint type="info">the model file has to have {length} lines</Hint>
      {infoText && <Hint type="warn">{infoText}</Hint>}
      <div>
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
  <div className="flex border border-black px-2 py-1">
    <span style={{ marginRight: "10px" }}>{name}</span>
    <button
      className="flex items-center"
      href="/#"
      onClick={(e) => {
        e.preventDefault();
        removeModel(name);
      }}
    >
      <FaTimes className="text-black w-[20px] h-[20px]" />
    </button>
  </div>
);

const ModelList = ({ models, removeModel }) => (
  <div className="flex flex-wrap gap-2">
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
    <div className="flex items-top gap-3">
      <div className="basis-[45%]">
        <Card full>
          <CardHead>
            <HeadingBig>Document</HeadingBig>
          </CardHead>
          <CardContent>
            {docMarkup ? <Markup markups={docMarkup} markupState={markupState} /> : doc}
          </CardContent>
        </Card>
      </div>
      <div className="basis-[55%]">
        <div className="flex flex-col gap-3">
          {models.map(([name, modelLine], i) => {
            const modelSelected = slot === i;
            const ModelEye = modelSelected ? EyeClosed : EyeOpen;
            return (
              <Card full key={name}>
                <CardHead>
                  <HeadingBig>{name}</HeadingBig>
                  <ModelEye className="w-9" onClick={() => toggleSlot(i)} />
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
    </div>
  );
};

const Visualize = ({ visualization, clear }) => {
  const { name, documents, models } = visualization;

  const { numPages, page, setPage, size, setSize } = usePagination(documents.length, 1, 1);
  const linesIndex = page - 1;

  useKey("Escape", clear);
  useKey("ArrowLeft", () => setPage((old) => old - 1));
  useKey("ArrowRight", () => setPage((old) => old + 1));

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
      <HeadingBig>{name}</HeadingBig>
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
      <Button variant="primary" onClick={() => setModelModalOpen(true)}>
        <FaPlus />
      </Button>
      {modelModalIsOpen && (
        <ModelModal close={() => setModelModalOpen(false)} addModel={addModel} length={length} />
      )}
    </div>
  );
};

const VisualizationItem = ({ visualization, addModel, removeModel, visualize, remove }) => (
  <div className="shadow-md rounded-lg">
    <Disclosure>
      <div className="border border-black rounded-lg divide-y divide-gray-300">
        <DisclosureToggle>
          <div className="px-4 h-12 flex justify-between items-center w-full">
            <HeadingMedium raw>{visualization.id}</HeadingMedium>
            {!visualization.models.length && "a model needs to be added (click to expand)"}
            <BadgeGroup>
              <Badge>{`${visualization.documents.length} lines`}</Badge>
              <Badge>{`${visualization.models.length} models`}</Badge>
            </BadgeGroup>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                visualize();
              }}
            >
              Visualize
            </Button>
          </div>
        </DisclosureToggle>
        <DisclosureContent>
          <div className="p-4">
            <DeleteButton onClick={remove} />
            <div className="flex justify-center items-center">
              <h3 style={{ margin: 0, marginRight: "10px" }}>Models</h3>
              <AddModel length={visualization.documents.length} addModel={addModel} />
            </div>
            <ModelList models={visualization.models} removeModel={removeModel} />
          </div>
        </DisclosureContent>
      </div>
    </Disclosure>
  </div>
);

const AddVisualizationModal = ({ close, create }) => {
  const [name, setName] = useState("");
  const { infoText, setInfoText } = useState(null);
  const { fileName, setFile, lines } = useFile();

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
      <Input value={name} placeholder="name" onChange={(e) => setName(e.currentTarget.value)} />
      <ChooseFile kind="document file" fileName={fileName} setFile={setFile} lines={lines} />
      {infoText && <Hint type="warn">{infoText}</Hint>}
      <div>
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
      <div className="flex items-center">
        <Button variant="primary" onClick={openModal}>
          Create Visualization
        </Button>
      </div>
      {modalIsOpen && (
        <AddVisualizationModal close={() => setModalIsOpen(false)} create={vis.create} />
      )}
      <div className="flex flex-col gap-2">
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
      </div>
    </div>
  );
};

export { VisualizationView };
