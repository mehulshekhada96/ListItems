const Dealer = require("../models/DealerDataModel");
const fetch = require("node-fetch");
const addDealerData = async (req, res, next) => {
  const newDealer = await Dealer.create(
    {
      "Customer Code": req.body.customerCode,
      "Company Name": req.body.company,
      "Ship to Name": req.body.shipToName,
      "Physical Address Line 1": req.body.physicalAddress,
      City: req.body.city,
      State: req.body.state,
      Zip: req.body.zip,
      "Area Code": req.body.areaCode,
      "Phone Exchange": req.body.phoneExchange,
      "Physical Phone": req.body.physicalPhone,
      EMAIL_ADDRESS: req.body.emailAddress,
      EMAIL_ADDRESS_2: req.body.emailAddress2,
      "Profile Desc": req.body.profileDesc,
      Dist: req.body.dist,
      Account: req.body.account,
      Display: req.body.display,
      Date: req.body.date,
      EndDate: req.body.endDate,
      CRM: req.body.crm,
      Website: req.body.website,
      Lat: req.body.lat,
      Long: req.body.long,
    },
    (err, data) => {
      if (err) throw err;
      console.log(data);
    }
  );

  res.json({ error: "Uploaded Data Successfully" });
  next();
};

const getDealers = async (req, res, next) => {
  const dealers = await Dealer.find();
  res.locals.dealers = dealers;
  next();
};

const editDealerForm = async (req, res, next) => {
  console.log(req.params.index);
  const editDealer = await Dealer.findOne(
    { _id: req.params.index },
    (err, data) => {
      if (err) throw err;
      console.log(data);
    }
  );
  res.locals.editDealer = editDealer;

  res.json({ editDealer: res.locals.editDealer });
};

const updateData = async (req, res, next) => {
  const id = req.params.id;
  console.log("pageNumber =", req.body.pageNumber);

  const pageNumber = req.body.pageNumber;
  console.log("body=", req.body);
  Dealer.findOneAndUpdate(
    { _id: id },
    {
      "Customer Code": req.body.customerCode,
      "Company Name": req.body.company,
      "Ship to Name": req.body.shipToName,
      "Physical Address Line 1": req.body.physicalAddress,
      City: req.body.city,
      State: req.body.state,
      Zip: req.body.zip,
      "Area Code": req.body.areaCode,
      "Phone Exchange": req.body.phoneExchange,
      "Physical Phone": req.body.physicalPhone,
      EMAIL_ADDRESS: req.body.emailAddress,
      EMAIL_ADDRESS_2: req.body.emailAddress2,
      "Profile Desc": req.body.profileDesc,
      Dist: req.body.dist,
      Account: req.body.account,
      Display: req.body.display,
      Date: req.body.date,
      EndDate: req.body.endDate,
      CRM: req.body.crm,
      Website: req.body.website,
      Lat: req.body.lat,
      Long: req.body.long,
    },
    (err, data) => {
      if (err) {
        req.session.error = err;
        req.session.errorType = "Failure";
      }
      console.log("One updated", data);
    }
  );
  req.session.error = "One Data Updated";
  req.session.errorType = "Info";
  res.json({ updated: data });
  next();
};

const getAllDealers = async () => {
  const allDealers = await Dealer.find();
  // console.log(allDealers);
  let cities = [],
    states = [],
    zips = [],
    areaCodes = [];
  allDealers.forEach((e) => {
    if (e["City"] && !cities.includes(e["City"])) {
      cities.push(e["City"]);
    }
    if (e["State"] && !states.includes(e["State"])) {
      states.push(e["State"]);
    }
    if (e["Zip"] && !zips.includes(e["Zip"])) {
      zips.push(e["Zip"]);
    }
    if (e["Area Code"] && !areaCodes.includes(e["Area Code"])) {
      areaCodes.push(e["Area Code"]);
    }
  });
  // console.log(cities, states, zips, areaCodes);
  return { cities, states, zips, areaCodes };
};

const filterQuery = (req) => {
  let query = {};
  if (req.body.stateFilter) {
    query.State = req.body.stateFilter;
  }
  if (req.body.cityFilter) {
    query.City = req.body.cityFilter;
  }
  if (req.body.zipFilter) {
    query.Zip = req.body.zipFilter;
  }
  if (req.body.areaFilter) {
    query["Area Code"] = req.body.areaFilter;
  }
  return query;
};

const sortquery = (req) => {
  // console.log('sortQuery',req.query.sort)
  let sortQuery = {};
  switch (req.query.sort) {
    case "custCode":
      sortQuery["Customer Code"] = 1;
      break;
    case "-custCode":
      sortQuery["Customer Code"] = -1;
      break;
    case "companyName":
      sortQuery["Company Name"] = 1;
      break;
    case "-companyName":
      sortQuery["Company Name"] = -1;
      break;
    case "shipToName":
      sortQuery["Ship to Name"] = 1;
      break;
    case "-shipToName":
      sortQuery["Ship to Name"] = -1;
      break;
  }
  console.log(sortQuery);
  return sortQuery;
};
const dealerPagination = async (req, res, next) => {
  const dealerFilters = await getAllDealers2(req);
  var perPage = 8;
  var pageN = Number(req.params.pageN) || 1;
  console.log("pageNumber", pageN);
  await Dealer.find(filterQuery2(req))
    .sort(sortquery(req))
    .skip(perPage * pageN - perPage)
    .limit(perPage)
    .exec(function (err, dealers) {
      // console.log(dealers)
      Dealer.find(filterQuery2(req))
        .countDocuments()
        .exec(function (err, count) {
          if (err) return next(err);
          console.log("count = ", count);
          res.json({
            dealers: dealers,
            cities: dealerFilters.cities.sort(),
            zips: dealerFilters.zips.sort(),
            states: dealerFilters.states.sort(),
            areaCodes: dealerFilters.areaCodes.sort(),
            current: pageN,
            count: count,
            pages: Math.ceil(count / perPage),
          });
          // res.render("dealerDataForm", {
          //   dealers: dealers,

          //   // session: req.session,
          //   // name: req.session.user.name,
          //   // error: req.session.error,
          //   // errorType: req.session.errorType,

          // });
        });
    });
};
// extraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
const getAllDealers2 = async (req) => {
  const allDealers = await Dealer.find(filterQuery2(req));
  // console.log(allDealers);
  let cities = [],
    states = [],
    zips = [],
    areaCodes = [];
  allDealers.forEach((e) => {
    if (e["City"] && !cities.includes(e["City"])) {
      cities.push(e["City"]);
    }
    if (e["State"] && !states.includes(e["State"])) {
      states.push(e["State"]);
    }
    if (e["Zip"] && !zips.includes(e["Zip"])) {
      zips.push(e["Zip"]);
    }
    if (e["Area Code"] && !areaCodes.includes(e["Area Code"])) {
      areaCodes.push(e["Area Code"]);
    }
  });
  // console.log(cities, states, zips, areaCodes);
  return { cities, states, zips, areaCodes };
};

const filterQuery2 = (req) => {
  let query = {};
  console.log("query=", req.query);
  if (req.query.stateFilter && req.query.stateFilter != "undefined") {
    query.State = req.query.stateFilter.split(",");
  }
  if (req.query.cityFilter && req.query.cityFilter != "undefined") {
    query.City = req.query.cityFilter.split(",");
  }
  if (req.query.zipFilter && req.query.zipFilter != "undefined") {
    query.Zip = req.query.zipFilter.split(",");
  }
  if (req.query.areaFilter && req.query.areaFilter != "undefined") {
    query["Area Code"] = req.query.areaFilter.split(",");
  }
  return query;
};

const dealerPagination2 = async (req, res, next) => {
  console.log("query=", req.query);
  console.log("Request Query =", filterQuery2(req));
  const dealerFilters = await getAllDealers2(req);
  var perPage = 8;
  var pageN = req.query.pageN || 1;

  await Dealer.find(filterQuery2(req))
    // .sort({"Customer Code": 1})
    .skip(perPage * pageN - perPage)
    .limit(perPage)
    .exec(function (err, dealers) {
      // console.log(dealers)
      Dealer.find(filterQuery2(req))
        .count()
        .exec(function (err, count) {
          if (err) return next(err);
          console.log("count = ", count);
          res.render("dealerDataForm", {
            dealers: dealers,
            current: pageN,
            count: count,
            pages: Math.ceil(count / perPage),

            session: req.session,
            name: req.session.user.name,
            error: req.session.error,
            errorType: req.session.errorType,
            cities: dealerFilters.cities.sort(),
            zips: dealerFilters.zips.sort(),
            states: dealerFilters.states.sort(),
            areaCodes: dealerFilters.areaCodes.sort(),
          });
        });
    });
};

const nearby = async (req, res) => {
  let params = req.query;
  let pincode = Number(params.pincode);

  let radii = Number(params.radius);
  console.log("pincode ,radius", pincode, radii);
  const dataOfDealers = await Dealer.find();
  // .then(async (data) => {
  const nearDealer = [];
  const newArr = [];
  // console.log(data)

  dataOfDealers.forEach(async (e) => {
    if (e["Lat"] && e["Long"]) {
      let nearer = await distance(pincode, e["Lat"], e["Long"]).then((dist) => {
        // console.log('thenDist=',dist);
        if (dist <= radii) {
          // nearDealer.push(e);

          console.log(1, e.Lat);
          return e;
        }
        console.log(2, "Return e");
      });
      console.log(3, nearer.Lat);
      nearDealer.push(nearer);
      // console.log(nearer);
      console.log(31, nearDealer.length);
      // return nearDealer;
    }
  });
  setTimeout(async () => {
    console.log(4, nearDealer.length);
    nearDealer.forEach((e) => {
      console.log(e._id);
      newArr.push(e._id);
    });
    const dealerFilters = await getAllDealers2(req);
    var perPage = 8;
    var pageN = req.query.pageN || 1;

    await Dealer.find({ _id: newArr })
      // .sort({"Customer Code": 1})
      .skip(perPage * pageN - perPage)
      .limit(perPage)
      .exec(function (err, dealers) {
        console.log(dealers);
        Dealer.find({ _id: newArr })
          .count()
          .exec(function (err, count) {
            if (err) return next(err);
            console.log("count = ", count);
            res.json({
              dealers: dealers,
              cities: dealerFilters.cities.sort(),
              zips: dealerFilters.zips.sort(),
              states: dealerFilters.states.sort(),
              areaCodes: dealerFilters.areaCodes.sort(),
              current: pageN,
              count: count,
              pages: Math.ceil(count / perPage),
            });
          });
      });
    // console.log(newArr)
    // return newArr;
  }, 1000);
  // });
};
const distance = async (pincode, lat, lng) => {
  const location = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=AIzaSyAf_5lVGHvMEcsI3cRzIyrz9AxqaFtaEQk`
  )
    .then((result) => result.text())
    .then((text) => {
      return JSON.parse(text).results[0].geometry.location;
    });
  // console.log(location)
  // res.send(location);
  const lattitude = location.lat;
  const longitude = location.lng;
  // console.log(lattitude, longitude);
  // console.log(lat, lng);
  const radians = (x) => (x * Math.PI) / 180;
  let dist =
    6371 *
    Math.acos(
      Math.cos(radians(lattitude)) *
        Math.cos(radians(lat)) *
        Math.cos(radians(lng) - radians(longitude)) +
        Math.sin(radians(lattitude)) * Math.sin(radians(lat))
    );
  // console.log("distance = ", dist);
  return dist;
};

module.exports = {
  addDealerData: addDealerData,
  getDealers,
  editDealerForm,
  updateData,
  dealerPagination,
  dealerPagination2,
  getAllDealers,
  nearby,
};
