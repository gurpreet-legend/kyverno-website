/*
@TODOS
1. Make listed filters collapseable if they exceed a certain number.This would be help responsive issues
2. Make filtered policies shareable via query Params
*/

// local storage 
const searchParams = new URLSearchParams(window.location.search);
const wstorage = window.localStorage;
const getStoredValues = JSON.parse(wstorage.getItem(storedValues));
let initialPolicies = getStoredValues ? getStoredValues.length ?  getStoredValues: [] : [];
// initialPolicies = findQuery().length ? findQuery().split("+") : initialPolicies;

let chosenPolicies = initialPolicies;

// elements' lookup
const policyWrap = elem(".policy_grid");
const appliedFiltersEl = elem(".filters_applied");
const section = elem(".td-section");

// add filters on the sidebar
function populateFilters(data) {
  elem("#policy_filters").dataset.filters.split(",").forEach(function(filterType){
    let filters = new Set();
    data.forEach(function(item){
      filters.add(item[filterType]);
    });
    let filterTypeEl = elem(`.filter_${filterType}`);
    if (filters.size >= 1) {
      filters.forEach(function(filter){
        let filterButton = createEl();
        filterButton.className = "filter";
        filterButton.textContent = filter;
        filterTypeEl.appendChild(filterButton);
      });
    } else {
      filterTypeEl.classList.add("passive");
    }
  });
}

function createPolicy(body, link, policy, title) {
  const policyElem = document.createElement("a");
  policyElem.className = "policy";
  policyElem.href = link;
  policyElem.dataset.policy = policy;
  const policyTitle = document.createElement("h3");
  policyTitle.textContent = title;
  const policyBody = document.createElement("p");
  policyBody.textContent = body;
  policyElem.appendChild(policyTitle);
  policyElem.appendChild(policyBody);
  return policyElem;
}

function listPolicies(data) {
  data.forEach(policy => {
    policy = createPolicy(policy.body, policy.link, policy.filters, policy.title);
    elem(".policy_wrap").appendChild(policy);
  });
}

function updateQuery() {
  let queryS = "";
  chosenPolicies.forEach((policy, index) => {
    let p = encodeURI(policy.type);
    queryS += index ? `+${p}` : p;
  });
  
  if (('URLSearchParams' in window) && queryS != undefined) {
    let newRelativePathQuery;
    if(queryS.length) {
      searchParams.set(policyTypeQueryString, queryS);
      newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    } else {
      searchParams.delete(policyTypeQueryString);
      newRelativePathQuery = window.location.pathname;
    }
    history.pushState(null, '', newRelativePathQuery);
  }
}

function findQuery(query = policyTypeQueryString) {
  if(searchParams.has(query)){
    let c = searchParams.get(query);
    return decodeURI(c);
  }
  return "";
}

function createButton(policy, id = null){
  const policyEl = createEl();
  let list = "button button_filter";
  list += (id === null) ? " button_clear" : "";
  policyEl.id = id;
  policyEl.className = list;
  policyEl.textContent = policy;
  return policyEl;
};

function listAppliedFilters() {
  appliedFiltersEl.innerHTML = "";
  chosenPolicies.forEach(policy => {
    // check if filter is listed first;
    policy = policy.type;
    if(policy) {
      const id = `btn${policy.replaceAll(" ", "-").replaceAll("(", "").replaceAll(")", "")}`;
      if(!elem(`#${id}`)) {
        const policyEl = createButton(policy, id);
        appliedFiltersEl.appendChild(policyEl);
      }
    }
  });
  if (chosenPolicies.length > 1) {

    appliedFiltersEl.appendChild(createButton("clear all"));
  }
}

function groupBy(list, keyGetter) {
  // function from https://codereview.stackexchange.com/questions/111704/group-similar-objects-into-array-of-arrays
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

function filterPolicies(obj=chosenPolicies) {
  const policies = elems(".policy");
  const results = elem(".filters_results");
  let resultsTally = 0;
  const grouped = groupBy(obj, item => item.id);
  let filtersPresent = new Set();
  
  // only apply to list page
  if(policies) {
    policies.forEach(policy => {
      const applicableFilters = policy.dataset.policy.split("::");
      let shouldList = false;
      let verdict = [];
      
      grouped.forEach(group => {
        const hasFilter = group.map(item => {
          const itemFilter = item.type;
          filtersPresent.add(itemFilter);
          return applicableFilters.includes(itemFilter);
        });
        const internalVerdict = hasFilter.includes(true);
        verdict.push(internalVerdict);
      });
      
      shouldList = verdict.includes(false) ? false : true;
      
      if(shouldList) {
        policy.classList.remove(hidden);
        resultsTally += 1;
      } else {
        policy.classList.add(hidden);
      }
    });
  }
  
  results.innerHTML = `<span>${resultsTally}</span> Policies Found`;
  
  filtersPresent = Array.from(filtersPresent);
  
  elems(".filter").forEach(button => {
    const id = button.textContent;
    const newObj = obj.map(entry => entry.type);
    filtersPresent = filtersPresent.length ? filtersPresent : newObj;
    filtersPresent.includes(id) ? button.classList.add(active) : button.classList.remove(active);
  });
  
  section ? listAppliedFilters() : false;
  
  updateQuery();
}

function objIsInArray(obj,obj1) {
  let isEqual = [];
  obj.forEach((item, index) => {
    if(JSON.stringify(obj1) === JSON.stringify(item)) {
      isEqual.push(index);
    }
  });
  // returns index where object was found or null
  return isEqual.length ? isEqual[0] : null;
}

policyWrap.addEventListener("click", event => {
  let obj = chosenPolicies;
  const target = event.target;
  const isFilter = target.matches(".filter");
  if(isFilter) {
    const filterType = target.textContent;
    let group = target.parentNode.dataset.criteria;
    filterGroup = Object.create(null);
    filterGroup.id = group;
    filterGroup.type = filterType;
    filtered = objIsInArray(obj, filterGroup);
    if (filtered != null) {
      obj.splice(filtered, 1);
    } else {
      obj.push(filterGroup);
    }
    
    // persist filters
    wstorage.setItem(storedValues, JSON.stringify(obj));
    
    filterPolicies();
  
    if(!section) {
      window.location.href = new URL("policies", rootURL).href;
    }
  }

  const isButton = target.matches(".button");
  if(isButton) {
    const isClearAll = target.matches(".button_clear");
    if(isClearAll) {
      chosenPolicies = [];
    } else {
      console.log(chosenPolicies);
      const thisPolicyType = target.textContent;
      const remainingPolicies = [];
      chosenPolicies.forEach((policy) => {
        if(policy.type != thisPolicyType) {
          remainingPolicies.push(policy);
        };
      });
      chosenPolicies = remainingPolicies;
      console.log(chosenPolicies);
    }
    // persist filters
    wstorage.setItem(storedValues, JSON.stringify(chosenPolicies));
    updateQuery();
    filterPolicies();
  }
});

window.addEventListener('load', function() {
  // fetch file
  fetch(new URL("index.json", rootURL).href)
  .then(response => response.json())
  .then(function(data) {
    data = data.length ? data : [];
    section ? listPolicies(data) : false;
    // filter policies on load
    populateFilters(data);
    filterPolicies();
  })
  .catch((error) => console.error(error));
  
});
