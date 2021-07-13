const Dealer = require("../models/DealerDataModel");

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

  res.redirect("/dealers/1");
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

  res.render("edit-form.ejs", { editDealer: res.locals.editDealer });
};

const updateData = async (req, res, next) => {
  const id = req.params.id;
  const updated = req.body;
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
      if (err) throw err;
      console.log("One updated", data);
    }
  );
  
  res.redirect("/dealers/1");
  next();
};

const getAllDealers = async()=>{
  const allDealers = await Dealer.find()
  // console.log(allDealers);
  let cities = [], states = [], zips = [], areaCodes =[];
  allDealers.forEach(e=>{
    if(e["City"] &&!cities.includes(e["City"])){
      cities.push(e["City"]);
    }
    if(e["State"] && !states.includes(e["State"])){
      states.push(e["State"]);
    }
     if(e["Zip"] && !zips.includes(e["Zip"])){
      zips.push(e["Zip"]);
    }
     if(e["Area Code"] && !areaCodes.includes(e["Area Code"])){
      areaCodes.push(e["Area Code"]);
    }
   
  })
  // console.log(cities, states, zips, areaCodes);
  return {cities, states, zips, areaCodes}
}

const dealerFilters = (req, res) => {
  req.session.filters = req.body;
  res.redirect('/dealers/1');
}

const dealerSort = (req, res) => {
  req.session.sortBy = req.body.sort;
  res.redirect('/dealers/1');
}


const dealerPagination = async (req, res, next) => {

  const dealerFilters = await getAllDealers();
  var perPage = 8;
  var pageN = req.params.pageN || 1;

  await Dealer.find({})
    // .sort({"Customer Code": 1})
    .skip(perPage * pageN - perPage)
    .limit(perPage)
    .exec(function (err, dealers) {
      Dealer.count().exec(function (err, count) {
        if (err) return next(err);
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
          areaCodes : dealerFilters.areaCodes.sort()
        });
      });
    });
};

module.exports = {
  addDealerData: addDealerData,
  getDealers,
  editDealerForm,
  updateData,
  dealerPagination,
  getAllDealers
};
