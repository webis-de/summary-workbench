"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[827],{3905:(e,t,a)=>{a.d(t,{Zo:()=>c,kt:()=>d});var n=a(7294);function i(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function r(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?r(Object(a),!0).forEach((function(t){i(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,n,i=function(e,t){if(null==e)return{};var a,n,i={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(i[a]=e[a]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}var l=n.createContext({}),u=function(e){var t=n.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},c=function(e){var t=u(e.components);return n.createElement(l.Provider,{value:t},e.children)},h="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},p=n.forwardRef((function(e,t){var a=e.components,i=e.mdxType,r=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),h=u(a),p=i,d=h["".concat(l,".").concat(p)]||h[p]||m[p]||r;return a?n.createElement(d,o(o({ref:t},c),{},{components:a})):n.createElement(d,o({ref:t},c))}));function d(e,t){var a=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=a.length,o=new Array(r);o[0]=p;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[h]="string"==typeof e?e:i,o[1]=s;for(var u=2;u<r;u++)o[u]=a[u];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}p.displayName="MDXCreateElement"},2175:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>h,frontMatter:()=>r,metadata:()=>s,toc:()=>u});var n=a(7462),i=(a(7294),a(3905));const r={slug:"/",title:"Usage",sidebar_position:0},o=void 0,s={unversionedId:"usage",id:"usage",title:"Usage",description:"Summarization",source:"@site/docs/usage.md",sourceDirName:".",slug:"/",permalink:"/summary-workbench/",draft:!1,editUrl:"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/usage.md",tags:[],version:"current",sidebarPosition:0,frontMatter:{slug:"/",title:"Usage",sidebar_position:0},sidebar:"tutorialSidebar",next:{title:"Setup Quickstart",permalink:"/summary-workbench/setup_quickstart"}},l={},u=[{value:"Summarization",id:"summarization",level:2},{value:"Making a Summarization Request",id:"making-a-summarization-request",level:3},{value:"Inspect the Summaries",id:"inspect-the-summaries",level:3},{value:"Using a PDF Document as Input for the Summarization",id:"using-a-pdf-document-as-input-for-the-summarization",level:3},{value:"Evaluation",id:"evaluation",level:2},{value:"Making an Evaluation Request",id:"making-an-evaluation-request",level:3},{value:"Show Average Scores after Evaluating",id:"show-average-scores-after-evaluating",level:3},{value:"Visualize the Overlap for the Examples",id:"visualize-the-overlap-for-the-examples",level:3},{value:"Plotter Feature of the Evaluation View",id:"plotter-feature-of-the-evaluation-view",level:3}],c={toc:u};function h(e){let{components:t,...r}=e;return(0,i.kt)("wrapper",(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h2",{id:"summarization"},"Summarization"),(0,i.kt)("h3",{id:"making-a-summarization-request"},"Making a Summarization Request"),(0,i.kt)("p",null,"The following GIF shows how to enter text, select summarizers, set the summary length, and execute the summarization request."),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"Making a Summarization Request",src:a(900).Z,width:"1310",height:"641"})),(0,i.kt)("admonition",{type:"note"},(0,i.kt)("p",{parentName:"admonition"},"In the demo there is also a ",(0,i.kt)("inlineCode",{parentName:"p"},"Debug")," plugin, which is meant for us to to test the deployment for bugs.\nThis Summarizer will never produce meaningful results.")),(0,i.kt)("h3",{id:"inspect-the-summaries"},"Inspect the Summaries"),(0,i.kt)("p",null,"After executing the request the document with its summaries is shown.\nBy clicking the eye-icon, the lexical overlap is shown to see what part of the document got reused in the summary.\nBy clicking the bar-icon, the lexical overlap of the summaries with each other is shown.\nBy hovering an overlap section, all corresponding sections are highlighted in yellow and by clicking the section, the corresponding sections are scrolled into view."),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"Inspecting the Resulting Summaries",src:a(22).Z,width:"1310",height:"641"})),(0,i.kt)("h3",{id:"using-a-pdf-document-as-input-for-the-summarization"},"Using a PDF Document as Input for the Summarization"),(0,i.kt)("p",null,"Alternatively, a PDF-document can be used as an input.\nThe text is extracted with ",(0,i.kt)("a",{parentName:"p",href:"https://github.com/kermitt2/grobid"},"Grobid")," and extracted sections are shown on the left.\nBy clicking the entry, a section can be selected.\nThe selected sections are concatenated when submitted for summarization."),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"Using a PDF Document as Input for the Summarization",src:a(5164).Z,width:"1310",height:"641"})),(0,i.kt)("h2",{id:"evaluation"},"Evaluation"),(0,i.kt)("h3",{id:"making-an-evaluation-request"},"Making an Evaluation Request"),(0,i.kt)("p",null,"The following GIF shows how to input a file for evaluation, select metrics, execute the evaluation request, and save the result.\nBy hovering the question mark, a hint will appear that explains the required file format.\nAn example file can be downloaded by clicking the ",(0,i.kt)("inlineCode",{parentName:"p"},"Download Sample File")," button."),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"Making an Evaluation Request",src:a(6341).Z,width:"1310",height:"641"})),(0,i.kt)("admonition",{type:"note"},(0,i.kt)("p",{parentName:"admonition"},"In the demo there is also a ",(0,i.kt)("inlineCode",{parentName:"p"},"Debug")," plugin, which is meant for us to to test the deployment for bugs.\nThis Metric will never produce meaningful results.")),(0,i.kt)("h3",{id:"show-average-scores-after-evaluating"},"Show Average Scores after Evaluating"),(0,i.kt)("p",null,"The first tab shows the average score for the corresponding metric-model pair in a table.\nScores can be exported as latex table or CSV."),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"Show Average Scores after Evaluating",src:a(2641).Z,width:"1310",height:"641"})),(0,i.kt)("h3",{id:"visualize-the-overlap-for-the-examples"},"Visualize the Overlap for the Examples"),(0,i.kt)("p",null,"The second tab presents the evaluated texts for textual inspection.\nBy clicking the eye-icon labeled with ",(0,i.kt)("inlineCode",{parentName:"p"},"Lex-Doc")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"Lex-Ref"),", the lexical overlap is shown with the document and the reference respectively.\nBy clicking the eye-icon labeled with ",(0,i.kt)("inlineCode",{parentName:"p"},"Sem-Doc"),", the semantic overlap with the document is shown, which is computed by finding the top 3 most similar sentences using spaCy similarity for each summary sentence and highlighting them by the fraction of sentences that found this sentence."),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"Visualize the Overlap for the Examples",src:a(6799).Z,width:"1310",height:"641"})),(0,i.kt)("h3",{id:"plotter-feature-of-the-evaluation-view"},"Plotter Feature of the Evaluation View"),(0,i.kt)("p",null,"The third tab shows a graph where a scatter plot of 2 selected metrics is shown.\nWhen only one metric is selected, the other values for the other axis will be drawn from a uniform distribution.\nPoints can be selected to show a view similar to ",(0,i.kt)("a",{parentName:"p",href:"#visualize-the-overlap-for-the-examples"},"Visualize the Overlap for the Examples"),"."),(0,i.kt)("p",null,(0,i.kt)("img",{alt:"Plotter Feature of the Evaluation View",src:a(5430).Z,width:"1310",height:"641"})))}h.isMDXComponent=!0},6341:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/evaluation_input-588a21d3a43fae23b55a35be946a96f6.gif"},5430:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/evaluation_plotter-25fcd9792228d6c26d0510a59edd2abb.gif"},2641:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/evaluation_scores-6015f0f53a415e59790fe6fc2dc08050.gif"},6799:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/evaluation_visualization-c4757a583aa40b1b0978870f5d3537f3.gif"},900:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/summarize_input-5eae39750e6007f9b8e8a91f0f4c510e.gif"},5164:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/summarize_pdf_extract-0f0509ff43b37a9fc329d6600fd8936a.gif"},22:(e,t,a)=>{a.d(t,{Z:()=>n});const n=a.p+"assets/images/summarize_usage-9d99c534a374e877e052b472d93a1db1.gif"}}]);