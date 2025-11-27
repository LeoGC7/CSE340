const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = '<div class="nav-items">'
  list += '<a href="/" class="nav-item" title="Home page">Home</a>'
  data.rows.forEach((row) => {
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" class="nav-item" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
  })
  list += "</div>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li class="list-item">'
      grid +=  '<a class="image-container" href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img class="list-image" src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<h2>'
      grid += '<a class="list-title" href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span class="list-price">$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* *********************************
 * Single vehicle detail HTML
 * ********************************* */
Util.buildDetailPage = function(vehicle) {
  const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.inv_price);
  const mileage = new Intl.NumberFormat('en-US').format(vehicle.inv_miles);

  let detailHTML = '<div id="detail-wrapper">';
  detailHTML += `<div id="image-container"><img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model} vehicle" /></div>`;
  
  detailHTML += '<div id="detail-content">';
  detailHTML += `<h2 class="vehicle-title">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>`;
  detailHTML += `<p class="vehicle-price">Price: <span>${price}</span></p>`;
  detailHTML += '<h3>Vehicle Details</h3>';
  
  detailHTML += '<ul id="detail-list">';
  detailHTML += `<li><strong>Mileage:</strong> ${mileage}</li>`;
  detailHTML += `<li><strong>Color:</strong> ${vehicle.inv_color}</li>`;
  detailHTML += `<li><strong>Description:</strong> ${vehicle.inv_description}</li>`;
  detailHTML += '</ul>';
  
  detailHTML += '</div>'; 
  detailHTML += '</div>';

  return detailHTML;
}

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
 * Build classification select list 
 * *************************************** */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }

module.exports = Util