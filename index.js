const axios = require('axios');
const fs = require('fs');
const rulesets = require('./rules');

const PROVIDERS = [
  "eodc",
  "vito",
  "sentinelhub"
]; // eodc or vito or sentinelhub

async function run(provider) {

  console.log("backend: " + provider);

  const backends = (await axios('https://openeocloud.vito.be/openeo/1.0.0')).data.federation;
  console.assert(!!backends, "can't read backends from aggregator");
  console.assert(provider in backends, "can't find backend in federation");
  const backendUrl = backends[provider].url;

  const allProcesses = (await axios('https://openeocloud.vito.be/openeo/1.0.0/processes')).data.processes;
  console.assert(allProcesses && allProcesses.length > 0, "No processes available at aggregator");

  const specProcesses = (await axios('https://processes.openeo.org/processes.json')).data;
  console.assert(specProcesses && specProcesses.length > 0, "No processes available from openeo-processes spec");

  const processes = (await axios(backendUrl + "/processes")).data.processes;
  console.assert(processes && processes.length > 0, "No processes available at backend");

  let migration = {
    create_raster_cube: 'create_data_cube',
    text_merge: 'text_concat',
    load_result: 'load_stac',
    debug: 'inspect'
  };

  let sections = [
    "# openEO process compliance report",
    "The report is based on openEO processes v2.0.0-rc.1, but also works for previous versions. It may give some hints on migration steps.",
    [
      "**Any general known issues:**",
      "- ..."
    ],
    [
      "**Comments:**",
      "- ..."
    ],
  ];
  for(let aggProcess of allProcesses) {
    let id = aggProcess.id;
    let process = processes.find(p => p.id === id);
    let spec = specProcesses.find(p => p.id === id);
    let renamed = id in migration;

    let section = [];

    let types = [];
    if (!spec && !renamed) {
      types.push("custom");
    }
    if (process && process.experimental) {
      types.push("experimental");
    }
    let appendix;
    if (types.length > 0) {
      appendix = " (" + types.join(', ') + ")";
    }
    else {
      appendix = "";
    }

    section.push(`## ${id}${appendix}`);
    section.push(`- [${process ? 'x' : ' '}] is supported - Known issues:`);

    if (renamed) {
      let migrated = processes.find(p => p.id === migration[id]);
      section.push(`- [${migrated ? 'x' : ' '}] Migration to \`${migration[id]}\` is planned or done`);
      if (process) {
        section.push(`- [${process.deprecated ? 'x' : ' '}] marked as deprecated`);
      }
    }

    if (spec) {
      let findParam = (name, source = spec) => source.parameters.find(p => p.name === name);
      let perParamSchema = cb => spec.parameters.filter(p => (Array.isArray(p.schema) && p.schema.find(cb) || cb(p.schema)));

      if (process) {
        if (!spec.experimental && process.experimental) {
          section.push(`- [ ] planned to be stable`);
        }
        else if (spec.experimental && !process.experimental) {
          section.push(`- [ ] marked as experimental`);
        }
      }

      spec.parameters.filter(p => p.deprecated).forEach(p => {
        let pp = process && findParam(p.name, process);
        section.push(`- [${pp && pp.deprecated ? 'x' : ' '}] Parameter \`${p.name}\`: marked as deprecated`);
      });

      if (spec.categories.includes("cubes")) {
        section.push(`- [ ] has been tested on > 100x100km at 10m resolution (or equivalent)`);
      }

      if (findParam('reducer')) {
        section.push(`- [ ] Parameter \`reducer\`: All processes in the category \`reducer\` can be used. Missing:`);
      }

      let cbParam = spec.parameters.find(p => p.name === 'reducer' || p.name === 'process');
      if (cbParam) {
        section.push(`- [ ] Parameter \`${cbParam.name}\`: All processes in the categories \`array\`, \`comparison\`, \`logic\` and \`math\` can be used (in a chain of processes). Missing:`);
        if (spec.id !== 'apply') {
          section.push(`- [ ] Parameter \`${cbParam.name}\`: Supports access to labels in the callback`);
        }
      }

      if (findParam('context', process)) {
        section.push(`- [ ] Parameter \`context\`: is supported and passed to the callback`);
      }

      let dimParam = findParam('dimension') || (spec.id.includes("dimension") && findParam('name'));
      if (dimParam) {
        section.push(`- [ ] Parameter \`${dimParam.name}\`: All suitable dimensions are supported`);
      }

      if (process) {
        perParamSchema(s => Array.isArray(s.enum)).forEach(p => {
          section.push(`- [ ] Parameter \`${p.name}\`: \`enum\` reflects implemention (all values are supported)`);
        });

        perParamSchema(s => s.subtype === 'metadata-filters').forEach(p => {
          section.push(`- [ ] Parameter \`${p.name}\`: All processes in the categories \`comparison\`, \`logic\` and \`text\` can be used.`);
        });

        perParamSchema(s => s.subtype === 'bounding-box').forEach(p => {
          section.push(`- [ ] Parameter \`${p.name}\`: Supports filtering by base/height or schema has been adapted`);
        });
      }
    }

    let processRules = rulesets.processes[aggProcess.id] || [];
    for(let rule of processRules) {
      let label = rulesets.rules[rule] || rule;
      section.push(`- [ ] ${label}`);
    }

    sections.push(section);
  }

  return sections
    .map(sec => {
      if (!Array.isArray(sec)) {
        sec = [sec];
      }
      return sec.join("\r\n");
    })
    .join("\r\n\r\n")
}

for(let p of PROVIDERS) {
  run(p)
    .then(content => {
      fs.writeFileSync(`process-report-${p}.md`, content);
    })
    .catch(console.error);
  }
