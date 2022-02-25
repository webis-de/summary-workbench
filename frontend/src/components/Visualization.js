import React, { useMemo, useReducer, useRef } from "react";

import { Button } from "./utils/Button";
import { ChooseFile, useFile } from "./utils/ChooseFile";
import { Input } from "./utils/Form";

const AddModel = ({ file, setFile, lines, linesAreSame, addModel }) => {
  const inputRef = useRef();
  return (
    <div className="flex flex-col">
      <Input ref={inputRef} placeholder="Name" />
      <ChooseFile
        placeholder="Upload Predictions"
        file={file}
        setFile={setFile}
        lines={lines}
        linesAreSame={linesAreSame}
      />
      <Button onClick={() => addModel([inputRef.current.value, lines, file.name])}>
        Add Model
      </Button>
    </div>
  );
};

const Visualization = () => {
  const { lines: docFileLines, setFile: setDocFile } = useFile();
  const { lines: refFileLines, setFile: setRefFile } = useFile();
  const { lines: predFileLines, setFile: setPredFile } = useFile();
  const linesAreSame = useMemo(
    () => (refFileLines !== null && docFileLines !== null ? refFileLines === docFileLines : null),
    [refFileLines, docFileLines]
  );
  const [models, addModel] = useReducer((oldState, model) => [model, ...oldState], []);

  return (
    <>
      <div>
        <div>
          <div>
            <div className="inline-flex flex-col">
              <ChooseFile
                kind="Documents"
                setFile={setDocFile}
                lines={docFileLines}
                linesAreSame={linesAreSame}
              />

              <ChooseFile
                kind="References"
                setFile={setRefFile}
                lines={refFileLines}
                linesAreSame={linesAreSame}
              />
              <Button>Add Model</Button>
              {Boolean(models.length) && (
                <>
                  <Button>Add Anotation</Button>
                  <Button>Visualize</Button>
                  <Button>Save</Button>
                </>
              )}
            </div>
          </div>
          <AddModel
            style={{ flexGrow: 1 }}
            file={predFile}
            setFile={setPredFile}
            lines={predFileLines}
            linesAreSame={null}
            addModel={addModel}
          />
        </div>
        {Boolean(models.length) && (
          <TableWrapper>
            <Table>
              <Tbody>
                {models.map((model) => (
                  <Tr hover stripe>
                    {model.map((entry) => (
                      <Td>{entry}</Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableWrapper>
        )}
      </div>
    </>
  );
};

export { Visualization };
