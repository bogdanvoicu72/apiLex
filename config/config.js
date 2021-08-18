const config={
    production :{
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },
    default : {
        SECRET: 'lexbitwize',
        DATABASE: 'mongodb+srv://bitwize:Bitwizedev99!@cluster0.nsu9t.mongodb.net/myFirstDatabase?',
        user:'beoriginalbynofake@gmail.com',
        pass: 'Thtlfrctyuy99'

    }
}


exports.get = function get(env){
    return config[env] || config.default
}

