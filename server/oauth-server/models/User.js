import mongoose, {Schema} from "mongoose";

const UserSchema = mongoose.Schema(
    {
        firstName:{
            type: String,
            required: true
        },
        lastName:{
            type: String,
            required: true
        },
        username:{
            type: String,
            required: true,
            unique: true
        },
        email:{
            type: String,
            required: true,
            unique: true
        },
        password:{
            type: String,
            required: true
        },
        profileImage:{
            type: String,
            required: false,
            default: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8HDxAPEBAQDxMOEA8QEBINDw8QDxAPFREWFhYSFhMYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAOEA4QMBIgACEQEDEQH/xAAbAAEBAAMBAQEAAAAAAAAAAAAABQEEBgMCB//EADIQAQABAgMEBwgDAQEAAAAAAAABAgMEESEFMVFxEhMyQWGRsSJCcoGhwdHhUqLwYiP/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A/awAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABjc0cRtKmjSiOlPH3f2DfYmckK7jLl3fVMeFOkPCZz8QdJE5suajR62sVctbqp5TrH1B0AnYfacTpXGXjG75woU1RVGcTnE98bgZAAAAAAAAAAAAAAAAAAAAYqqimM50iN+bKVtXE9KerjdHa8Z4fIHjjcbOI0jSnh3z4z+GoAAAAADYwmKqw08aZ3x944S1wHR2rkXYiqNYl9ouzsT1NWU9mr6T3StAAAAAAAAAAAAAAAAAAA879zqaaqv4xn8+5z0znrO+d/NX2tX0bcR/KqPpqjgAAAAAAAAL2Bu9dbpnvjSecf6EFU2NV26eU/b8ApAAAAAAAAAAAAAAAAAAnbZ7NHxT6JSxtanpW8/wCNUT56I4AAAAAAAACjsbtV/DHqnKmxqdK6uUeWv3BSAAAAAAAAAAAAAAAAAB8XrfW0zT/KMnO1RNMzE6TGk83Spe1cNlPWRunteE8QTQAAAAAAAF/BWupt0x3755ym7Nw3XVdKezTPnVwWQAAAAAAAAAAAAAAAAAAGJjpaTrnxYrriiM5mIjjOjxs423eq6MTyzjLPkCbjcDNj2qdafOaefh4tN0zSxOzqbutPsT/Wfl3AjDZu4G5b93P4dXhNE074mOcSD5GYpme6flEve3g7lzdTMfFp6g12zg8JViZ4U98/aOLdw+zIp1rnpeEbv234jLSNMuAMW6ItxFMRlEPp4YjF0YeYiZ1nujWYjjL0tXabsZ0zEx4A+wAAAAAAAAAAAAAAAGni8fTZ0p9qr6Rza2Ox/SzponTvq48k4HpevVXpzqnP0jlDzAG/hdpTRpX7Ucfe/anZv0XuzVE+vk51mJyB0og28bct+9M/FlPq9o2pcjuon5T+QWBHnalzhR5T+XlXjrtfvZfDEQC1cu02ozqmI5p2J2nnpbjL/qd/yhOmZq1mc+erAM1TNU5zOczvmd8vq3cm1OdMzE+D4AVsJtGK9K8qZ4+7P4UHMt3A46bPs1a0/Wn9AsjETFUZxrE6wyAAAAAAAAAAAlbSxnSzopnT3pjv8OTY2liupjox2qo8qeKMAAAAAAAAAAAAAAAADd2fjOono1dmf6zx5LDmlTZWKz/857uzy4ApAAAAAAAAPm5XFuJqndEZy+k3a97KIojv1n7AnXrs3qpqnfP08HwAAAAAAAAAAAAAAAAADNNU0TExpMawwA6HDXov0xVx3+E98PVI2Te6NU0Tuq1j4o/SuAAAAAAA57FXeurqq4zpyjcuYqvq6Kp4ROXOdHPAAAAAAAAAAAAAAAAAAAAA+qK5tzFUb4mJh0VNXSiJjvjP5ObXNm19O1T/AM50+X+gG0AAAAADS2tVlby41RH3+yMrbYn2afin0SQAAAAAAAAAAAAAAAAAAAAFXY1WlceMT5x+kpR2NOtfKPUFUAAAAAE7bPZo5z6JQAAAAAAAAAAAAAAAAAAAAAKGxu1V8MeoArAAAA//2Q=="
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        roles: {
            type: [Schema.Types.ObjectId],
            required: true,
            ref: "Role"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("User", UserSchema);
