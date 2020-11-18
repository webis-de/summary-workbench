import React, { useContext, useState } from "react";
import { FaRegFile } from "react-icons/fa";
import { FaInfoCircle } from "react-icons/fa";
import { evaluateRequest } from "../api";
import { CalculateContext } from "../contexts/CalculateContext";
import { SettingsContext } from "../contexts/SettingsContext";
import { markup } from "../utils/fragcolors";
import { readFile } from "../utils/readFile";
import { ChooseFile } from "./utils/ChooseFile";
import { Section } from "./utils/Section";
import { Loading } from "./utils/Loading";
import { Button } from "./utils/Button";

const Upload = ({ className, reloadResult }) => {
  const [hypFile, setHypFile] = useState(null);
  const [refFile, setRefFile] = useState(null);

  const { settings } = useContext(SettingsContext);
  const { setCalculateResult } = useContext(CalculateContext);

  const [isComputing, setIsComputing] = useState(false);

  const getChosenMetrics = () =>
    Object.entries(settings)
      .filter(([metric, { is_set }]) => is_set)
      .map(([metric, metricInfo]) => metric);

  const getComparisons = (hypdata, refdata) => {
    const hyplines = hypdata.split("\n");
    const reflines = refdata.split("\n");
    return hyplines.map((hypline, i) => markup(hypline, reflines[i]));
  };

  const compute = (summ_eval = false) => {
    if (hypFile !== null && refFile !== null) {
      setIsComputing(true);

      Promise.all([
        readFile(hypFile).then((text) => text.trim()),
        readFile(refFile).then((text) => text.trim()),
      ]).then(([hypdata, refdata]) => {
        const hyplines = hypdata.split("\n");
        const reflines = refdata.split("\n");
        const name = hypFile.name + "-" + refFile.name;
        const chosenMetrics = getChosenMetrics();

        if (hyplines.length === reflines.length) {
          if (chosenMetrics.length > 0) {
            evaluateRequest(chosenMetrics, hyplines, reflines, summ_eval)
              .then((scores) => {
                const comparisons = getComparisons(hypdata, refdata);
                setCalculateResult({ name, scores, comparisons });
                reloadResult();
              })
              .catch((error) => {
                if (error instanceof TypeError) {
                  alert("server not available");
                } else {
                  alert("internal server error");
                }
              })
              .finally(() => setIsComputing(false));
          } else {
            const comparisons = getComparisons(hypdata, refdata, summ_eval);
            setCalculateResult({ name, scores: {}, comparisons });
            reloadResult();
            setIsComputing(false);
          }
        } else {
          setIsComputing(false);
          alert("files have to have equal number of lines");
        }
      });
    } else {
      alert("choose file");
    }
  };

  return (
    <Section
      title={
        <div>
          <p className="card-title"><FaRegFile /> Upload files</p> 
        </div>
      }
    >
      <p className="uk-text-primary" style={{"marginTop":"-25px"}}> <FaInfoCircle /> Both files must contain the same number of non-empty lines</p>
      <div
        className="uk-margin uk-grid uk-grid-small uk-child-width-1-2@s"
        style={{ gridRowGap: "10px" }}
      >
        <ChooseFile kind="reference texts" file={refFile} setFile={setRefFile} name="RefFile" />
        <ChooseFile kind="generated texts" file={hypFile} setFile={setHypFile} name="HypFile" />
      </div>
      <div className="uk-flex uk-flex-left">
        <Loading isLoading={isComputing}>
          {/* <Button variant="primary" onClick={() => compute(false)}>
            {"Evaluate"}
          </Button> */}
          <div />
          <Button variant="primary" onClick={() => compute(true)}>
            {"Evaluate"}
          </Button>
        </Loading>
      </div>
    </Section>
  );
};

export { Upload };
