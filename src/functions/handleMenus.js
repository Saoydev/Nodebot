const fs = require('fs')


module.exports = (Client) => {

    
Client.Menus = new Map()
    
        const Menus = fs.readdirSync(`./src/b_menus`).filter(d => d.endsWith('.js'))
        for (let file of Menus) {
            let pull = require(`../b_menus/${file}`)
            Client.Menus.set(pull.name, pull)}

}