"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[833],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>c});var a=n(7294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var p=a.createContext({}),m=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=m(e.components);return a.createElement(p.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,p=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),d=m(n),c=i,g=d["".concat(p,".").concat(c)]||d[c]||u[c]||r;return n?a.createElement(g,l(l({ref:t},s),{},{components:n})):a.createElement(g,l({ref:t},s))}));function c(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,l=new Array(r);l[0]=d;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o.mdxType="string"==typeof e?e:i,l[1]=o;for(var m=2;m<r;m++)l[m]=n[m];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},1567:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>u,frontMatter:()=>r,metadata:()=>o,toc:()=>m});var a=n(7462),i=(n(7294),n(3905));const r={title:"Writing a Plugin",sidebar_position:3},l=void 0,o={unversionedId:"writing-a-plugin",id:"writing-a-plugin",title:"Writing a Plugin",description:"This section explains how you can write your own metrics or summarizers to integrate with Summary Workbench.",source:"@site/docs/writing-a-plugin.md",sourceDirName:".",slug:"/writing-a-plugin",permalink:"/summary-workbench/writing-a-plugin",draft:!1,editUrl:"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/writing-a-plugin.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{title:"Writing a Plugin",sidebar_position:3},sidebar:"tutorialSidebar",previous:{title:"Configuration",permalink:"/summary-workbench/configuration"},next:{title:"Deployment",permalink:"/summary-workbench/deployment"}},p={},m=[{value:"Plugin folder structure",id:"plugin-folder-structure",level:2},{value:"sw-plugin-config.yaml",id:"sw-plugin-configyaml",level:2},{value:"Completion",id:"completion",level:3},{value:"Metric plugin specific configuration",id:"metric-plugin-specific-configuration",level:2},{value:"Summarizer plugin specific configuration",id:"summarizer-plugin-specific-configuration",level:2},{value:"Important remarks",id:"important-remarks",level:2},{value:"Required arguments",id:"required-arguments",level:2},{value:"Extra arguments",id:"extra-arguments",level:2},{value:"Generic plugins",id:"generic-plugins",level:2},{value:"Dynamic Metadata",id:"dynamic-metadata",level:2},{value:"Tips",id:"tips",level:2}],s={toc:m};function u(e){let{components:t,...n}=e;return(0,i.kt)("wrapper",(0,a.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"This section explains how you can write your own metrics or summarizers to integrate with Summary Workbench.\nTo help you get started, take a look at the predefined plugins located in the ",(0,i.kt)("inlineCode",{parentName:"p"},"metrics/")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"summarizers/")," folders."),(0,i.kt)("h2",{id:"plugin-folder-structure"},"Plugin folder structure"),(0,i.kt)("p",null,"A plugin is a folder or git repository which contains the following files:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"file"),(0,i.kt)("th",{parentName:"tr",align:null},"required"),(0,i.kt)("th",{parentName:"tr",align:null},"description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"sw-plugin-config.yaml"),(0,i.kt)("td",{parentName:"tr",align:null},"yes"),(0,i.kt)("td",{parentName:"tr",align:null},"see ",(0,i.kt)("a",{parentName:"td",href:"#sw-plugin-configyaml"},"sw-plugin-config.yaml"))),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"Dockerfile"),(0,i.kt)("td",{parentName:"tr",align:null},"no"),(0,i.kt)("td",{parentName:"tr",align:null},"if not specified, ",(0,i.kt)("inlineCode",{parentName:"td"},"docker/Dockerfile.plugin")," will be used which can be found under the repository root")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"metric.py, metric folder, summarizer.py, summarizer folder"),(0,i.kt)("td",{parentName:"tr",align:null},"yes (one)"),(0,i.kt)("td",{parentName:"tr",align:null},"metric.py or metric folder for metric plugin, summarizer.py or summarizer folder for summarizer plugin")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"model_setup.py"),(0,i.kt)("td",{parentName:"tr",align:null},"yes"),(0,i.kt)("td",{parentName:"tr",align:null},"Is used to setup your application (i.e. download models). Leave it empty if no external data is needed. The file is required to remind the plugin creator that external data should be stored locally. All plugins can run without writing anything into this file but this can lead to performance issues (i.e. the models are downloaded on every restart of the container).")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"Pipfile.lock, Pipfile, requirements.txt"),(0,i.kt)("td",{parentName:"tr",align:null},"yes (one)"),(0,i.kt)("td",{parentName:"tr",align:null},"contains the packages required by your application")))),(0,i.kt)("h2",{id:"sw-plugin-configyaml"},"sw-plugin-config.yaml"),(0,i.kt)("p",null,"Following Options can be specified in the ",(0,i.kt)("inlineCode",{parentName:"p"},"sw-plugin-config.yaml")," file:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"option"),(0,i.kt)("th",{parentName:"tr",align:null},"required"),(0,i.kt)("th",{parentName:"tr",align:null},"description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"version"),(0,i.kt)("td",{parentName:"tr",align:null},"yes"),(0,i.kt)("td",{parentName:"tr",align:null},"version string of the plugin (start with ",(0,i.kt)("inlineCode",{parentName:"td"},'"1.0"')," and increment if you make changes) make sure the version is a string and not a float (e.g. ",(0,i.kt)("inlineCode",{parentName:"td"},'"1.0"')," instead of ",(0,i.kt)("inlineCode",{parentName:"td"},"1.0"),")")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"name"),(0,i.kt)("td",{parentName:"tr",align:null},"yes"),(0,i.kt)("td",{parentName:"tr",align:null},"name of the plugin (e.g. ",(0,i.kt)("inlineCode",{parentName:"td"},"BERTScore"),")")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"metadata"),(0,i.kt)("td",{parentName:"tr",align:null},"no"),(0,i.kt)("td",{parentName:"tr",align:null},"Dictionary with extra data that is available to the container during build time and when running. This data is also returned when querying for available metrics/summarizers. Metadata we use to display information about the plugin in the frontend are ",(0,i.kt)("inlineCode",{parentName:"td"},"type")," (extractive/abstractive/semantic/lexical), ",(0,i.kt)("inlineCode",{parentName:"td"},"model")," (configured deep learning model), ",(0,i.kt)("inlineCode",{parentName:"td"},"homepage")," (url to homepage, developer of plugin or paper) and ",(0,i.kt)("inlineCode",{parentName:"td"},"sourcecode")," (url to plugin or used implementation).")))),(0,i.kt)("h3",{id:"completion"},"Completion"),(0,i.kt)("p",null,"Follow the steps under ",(0,i.kt)("a",{parentName:"p",href:"/configuration#completion"},"configuration#completion")," to setup completion."),(0,i.kt)("h2",{id:"metric-plugin-specific-configuration"},"Metric plugin specific configuration"),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"metric.py")," file should have a class ",(0,i.kt)("inlineCode",{parentName:"p"},"MetricPlugin")," with the following methods:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-python"},"from typing import List, Tuple\n\nclass MetricPlugin:\n    def evaluate(self, batch: List[Tuple[str, str]]) -> List[float]:\n        hypotheses, references = zip(*batch)\n        # your code\n        return scores\n")),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"batch")," argument contains hypotheses-reference pairs.\nFor each pairs one score has to be computed and returned as a list where the order corresponds to the order of the pairs in the batch."),(0,i.kt)("h2",{id:"summarizer-plugin-specific-configuration"},"Summarizer plugin specific configuration"),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"summarizer.py")," file should have a class ",(0,i.kt)("inlineCode",{parentName:"p"},"SummarizerPlugin")," with the following methods:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-python"},"from typing import List, Union\n\nclass SummarizerPlugin:\n    def summarize(self, batch: List[str], ratio: float) -> Union[List[str], List[List[str]]]:\n        # your code\n        return summaries\n")),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"batch")," argument contains texts that have to be summarized and the ratio is a number between 0 and 1 that specifies the desired length of the summary with respect to the length of the source text.\nSummaries can be either a string or a list of sentences."),(0,i.kt)("h2",{id:"important-remarks"},"Important remarks"),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"THREADS")," environment variable as described in ",(0,i.kt)("a",{parentName:"p",href:"setup_quickstart#extern-environment"},"setup_quickstart#extern-environment")," configures the number of parallel calls to the ",(0,i.kt)("inlineCode",{parentName:"p"},"evaluate")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"summarize")," function.\nMake sure that your function is threads safe by using ",(0,i.kt)("inlineCode",{parentName:"p"},"threading.Lock")," if necessary."),(0,i.kt)("h2",{id:"required-arguments"},"Required arguments"),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"batch")," argument for both plugin types and the ",(0,i.kt)("inlineCode",{parentName:"p"},"ratio")," argument for the summarizer plugin can not be called different because they are passed as keyword arguments.\nIn general type annotations should be omitted for the required arguments but they can be added if they have the annotated type is correct."),(0,i.kt)("h2",{id:"extra-arguments"},"Extra arguments"),(0,i.kt)("p",null,"You can define your own arguments simply by adding them to the function definition:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-python"},"from typing import List, Union, Literal\nfrom pydantic import Field\n\nclass SummarizerPlugin:\n    def summarize(\n      self,\n      batch,\n      ratio,\n      argument1: bool,\n      argument2: Literal[1, 2, 3] = 2,\n      argument3: int = Field(..., ge=0, le=10),\n    ) -> Union[List[str], List[List[str]]]:\n        # your code\n        return summaries\n")),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"Field")," attribute from ",(0,i.kt)("a",{parentName:"p",href:"https://pydantic-docs.helpmanual.io/"},"pydantic")," can be used to define extra constrains for the arguments.\nIn the example ",(0,i.kt)("inlineCode",{parentName:"p"},"argument1")," is a Boolean argument without a default value, ",(0,i.kt)("inlineCode",{parentName:"p"},"argument2")," is a categorical argument with 3 types and ",(0,i.kt)("inlineCode",{parentName:"p"},"2")," as the default argument and ",(0,i.kt)("inlineCode",{parentName:"p"},"argument3")," is an integer argument with no default argument that has to be at least 0 and at most 10."),(0,i.kt)("admonition",{type:"info"},(0,i.kt)("p",{parentName:"admonition"},"A pydantic model is build to evaluate the function arguments before passing them to the function.\nTherefore it is not necessary to check if the arguments are valid.\nThe pydantic model is converted into json-schema and passed to the frontend to generate the form to input argument values.\nThe form generator currently supports Boolean, categorical, integer, float and string arguments.")),(0,i.kt)("h2",{id:"generic-plugins"},"Generic plugins"),(0,i.kt)("p",null,"Sometimes you want to have a generic plugin (a plugin that can take different models).",(0,i.kt)("br",{parentName:"p"}),"\n","In that case you can specify the model by providing it as an environment variable via the ",(0,i.kt)("inlineCode",{parentName:"p"},"environment")," key in the ",(0,i.kt)("inlineCode",{parentName:"p"},"sw-config.yaml"),"\nYou can also add environment variable values to the name of the plugin by using format strings."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-yaml",metastring:'title="example sw-plugin-config.yaml"',title:'"example','sw-plugin-config.yaml"':!0},'version: "1.0"\nname: "CoolSummarizer ({model})"\n')),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-yaml",metastring:'title="example sw-config.yaml"',title:'"example','sw-config.yaml"':!0},"summarizers:\n  - source: <path-to-cool-summarizer>\n    environment:\n      model: cool model\n")),(0,i.kt)("p",null,"This will configure the plugin as ",(0,i.kt)("inlineCode",{parentName:"p"},"CoolSummarizer (cool model)")," and inside the container ",(0,i.kt)("inlineCode",{parentName:"p"},'os.environ["model"]')," will be ",(0,i.kt)("inlineCode",{parentName:"p"},"cool model")),(0,i.kt)("p",null,"For examples checkout ",(0,i.kt)("inlineCode",{parentName:"p"},"summarizer/neuralsum"),", ",(0,i.kt)("inlineCode",{parentName:"p"},"summarizer/cliffsum"),", and ",(0,i.kt)("inlineCode",{parentName:"p"},"summarizer/coopsum")),(0,i.kt)("h2",{id:"dynamic-metadata"},"Dynamic Metadata"),(0,i.kt)("p",null,"Metadata can be specified using the ",(0,i.kt)("inlineCode",{parentName:"p"},"metadata")," field in the ",(0,i.kt)("inlineCode",{parentName:"p"},"sw-plugin-config.yaml"),".\nThis approach is static and sometimes it is required to set the metadata based on some parameter.\nFor example with the following config it could be useful to expose the model as a metadata field."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-yaml",metastring:'title="example sw-config.yaml"',title:'"example','sw-config.yaml"':!0},"summarizers:\n  - source: <path-to-cool-summarizer>\n    environment:\n      model: cool model\n")),(0,i.kt)("p",null,"This is possible by adding a metadata method to the corresponding Plugin class, which returns a dictionary containing the metadata."),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-python",metastring:'title="example summarizer plugin (works the same for metric plugin)"',title:'"example',summarizer:!0,plugin:!0,"(works":!0,the:!0,same:!0,for:!0,metric:!0,'plugin)"':!0},'class SummarizerPlugin:\n    def __init__(self):\n        self.m = {"model": os.environ.get("model")}\n\n    def summarize(self, batch, ratio):\n        return ["example summary"] * len(batch)\n\n    def metadata(self):\n        return self.m\n')),(0,i.kt)("admonition",{type:"note"},(0,i.kt)("p",{parentName:"admonition"},"The dynamic metadata returned from the metadata method will overwrite the static metadata specified in the ",(0,i.kt)("inlineCode",{parentName:"p"},"sw-plugin-config.yaml")," file.")),(0,i.kt)("h2",{id:"tips"},"Tips"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"Writing a simple plugin is very easy and you probably need only very few information from this page.",(0,i.kt)("br",{parentName:"p"}),"\n","Most of the time copying an existing plugin from ",(0,i.kt)("inlineCode",{parentName:"p"},"metrics/")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"summarizer/")," and sticking to its structure will help to get started.")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"Everything under ",(0,i.kt)("inlineCode",{parentName:"p"},"/root")," (the home folder) in the container is stored in a volume.",(0,i.kt)("br",{parentName:"p"}),"\n","If you need external data, it should be stored there.",(0,i.kt)("br",{parentName:"p"}),"\n","Additionally it is advised to store downloaded files (e.g. models) in ",(0,i.kt)("inlineCode",{parentName:"p"},"~/.cache")," which will be expanded to ",(0,i.kt)("inlineCode",{parentName:"p"},"/root/.cache")," in the container (don't forget to use ",(0,i.kt)("inlineCode",{parentName:"p"},"os.path.expanduser")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"pathlib.Path.expanduser"),").")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"You are advised to use a ",(0,i.kt)("inlineCode",{parentName:"p"},"Pipfile")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"Pipfile.lock")," instead of a ",(0,i.kt)("inlineCode",{parentName:"p"},"requirements.txt"),", because it allows you to specify a python version.\nThe base image for the container will be the official docker image for the specified python version.",(0,i.kt)("br",{parentName:"p"}),"\n","The only alternative to specify a custom python version is to provide your own Dockerfile.")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"If your plugin is generic and can have multiple models, only download the specified model."))))}u.isMDXComponent=!0}}]);