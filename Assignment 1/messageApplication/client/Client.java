package com.srdc.messageApplication.client;
import java.io.*;
import java.net.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.Scanner;

//Client class that communicates with the client
public class Client {
    //Socket connection variables
    private Socket socket;
    private PrintWriter out;
    private BufferedReader in;

    //Boolean flag whether user is removed or not
    private boolean isRemoved = false;

    //Variables to track which user is currently in and whether it is admin or not
    private String username = null;
    private boolean isAdminFlag = false;

    //Constructor that initiates connection
    public Client(String serverAddress, int serverPort) {
        try {
            socket = new Socket(serverAddress, serverPort);
            out = new PrintWriter(socket.getOutputStream(), true);
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        } catch (ConnectException e) {
            System.err.println("Failed to connect to the server: Server is closed.");
            System.exit(1);
        } catch (UnknownHostException e) {
            System.err.println("Unknown host: " + serverAddress);
            System.exit(1);
        } catch (IOException e) {
            System.err.println("I/O error: " + e.getMessage());
            System.exit(1);
        }
    }
    // Function to handle requests based on user input
    public void handleRequest() {
        Scanner scanner = new Scanner(System.in);
        String userCommands = "LOGOUT, SENDMSG, INBOX, OUTBOX, EXIT";
        String adminCommands = "ADDUSER, UPDATEUSER, REMOVEUSER,LISTUSERS";
        if(isAdminFlag) {
            System.out.println("Enter command (" + adminCommands + ", " + userCommands + "):");
        }
        else{
            System.out.println("Enter command (" + userCommands + "):");
        }
        String command = scanner.nextLine().toUpperCase(Locale.ENGLISH);
        switch (command) { //Switch statements that calls necessary function based on the desired action
            case "LOGOUT":
                logout();
                break;
            case "ADDUSER":
                if(isAdminFlag) {
                    addUser();
                }
                else{System.out.println("Invalid command. Try again.");}
                break;
            case "UPDATEUSER":
                if(isAdminFlag) {
                    updateUser();
                }
                else{System.out.println("Invalid command. Try again.");}
                break;
            case "REMOVEUSER":
                if(isAdminFlag) {
                    removeUser();
                }
                else{System.out.println("Invalid command. Try again.");}
                break;
            case "LISTUSERS":
                if(isAdminFlag) {
                    listUsers();
                }
                else{System.out.println("Invalid command. Try again.");}
                break;
            case "SENDMSG":
                sendMessage();
                break;
            case "INBOX":
                checkInboxOrOutbox(true);
                break;
            case "OUTBOX":
                checkInboxOrOutbox(false);
                break;
            case "EXIT":
                System.out.println("Exitting, Goodbye!");
                System.exit(0);
                return;
            default:
                System.out.println("Invalid command. Try again.");
        }
    }

    //Login function that works when no one is logged
    public void login() {
        if(this.username == null){ //Checks whether another user is currently logged in
            Scanner scanner = new Scanner(System.in);
            System.out.print("Please login by entering your username and password \n");
            System.out.println("Enter username:");
            String username = scanner.nextLine();
            System.out.println("Enter password:");
            String password = scanner.nextLine();
            if(username.equals("") || password.equals("")){
                System.out.println("Username and password cannot be empty.");
            }
            else{
                sendMessage("LOGIN:::" + username + ":::" + password); //Sending the output string to the Socket
                String response = readMessage(); //Reading from the Socket
                if (response.startsWith("LOGIN successful")) {
                    this.username = username; //Change the current user
                    if(response.contains("admin")){
                        isAdminFlag = true; //If the current user is an admin save it using the flag
                    }
                }
                System.out.println(response);
            }
        }
        else{
            handleRequest();
        }
    }

    //Logout function when works when a user is logged in
    public void logout() {
        username = null; //Reset the current user to null
        isAdminFlag = false; //Reset the current Flag to false
        if(!isRemoved){
            sendMessage("LOGOUT:::" + username); //Sending the output string to the Socket
            String response = readMessage();  //Reading from the Socket
            System.out.println(response);
        }
    }

    //Checks whether the given string is a valid birthday or not
    public boolean validBirthdate(String birthdate){
        try{
            SimpleDateFormat sdf1 = new SimpleDateFormat("dd-MM-yyyy");
            java.util.Date date = sdf1.parse(birthdate);
            java.sql.Date dummyBirthdate = new java.sql.Date(date.getTime());
            return true;
        }catch (ParseException e){
            return false;
        }

    }

    //Add user function that adds a new user with a username that was not taken before
    public void addUser() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Enter new user details");
        System.out.println("Enter username:");
        String username;
        while(true){
            username = scanner.nextLine();
            if(userExists(username)){
                System.out.println("Username already exists. Try again.");
                System.out.println("Enter username:");
            }
            else if(username.equals("")){
                System.out.println("Username cannot be empty. Try again.");
                System.out.println("Enter username:");
            }
            else if(username.length() > 20){
                System.out.println("Username is too long. Try again.");
                System.out.println("Enter username:");
            }
            else {
                break;
            }
        }
        System.out.println("Enter name:");
        String name;
        while(true){
            name = scanner.nextLine();
            if(name.equals("")){
                System.out.println("Name cannot be empty. Try again.");
                System.out.println("Enter name:");
            }
            else if(name.length() > 20){
                System.out.println("Name is too long. Try again.");
                System.out.println("Enter name:");
            }
            else{
                break;
            }
        }

        System.out.println("Enter surname:");
        String surname;
        while (true){
            surname = scanner.nextLine();
            if(surname.equals("")){
                System.out.println("Surname cannot be empty. Try again.");
                System.out.println("Enter surname:");
            }
            else if(surname.length() > 20){
                System.out.println("Surname is too long. Try again.");
                System.out.println("Enter surname:");
            }
            else {
                break;
            }
        }

        System.out.println("Enter birthdate (DD-MM-YYYY):");
        String birthdate;
        while(true){
            birthdate = scanner.nextLine();
            if(validBirthdate(birthdate)){
                if(birthdate.equals("")){
                    System.out.println("Birth date cannot be empty. Try again.");
                    System.out.println("Enter birthdate (DD-MM-YYYY):");
                }
                else{
                    break;
                }
            }
            else{
                System.out.println("Invalid birthdate. Try again.");
                System.out.println("Enter birthdate (DD-MM-YYYY):");
            }
        }

        System.out.println("Enter gender (M or F):");
        String gender;

        while(true){
            gender = scanner.nextLine();
            if(gender.equals("") || (!gender.equals("M") && !gender.equals("F"))){
                System.out.println("Please enter a valid gender");
                System.out.println("Enter gender (M or F):");
            }
            else {
                break;
            }
        }

        System.out.println("Enter email:");
        String email;
        while(true){
            email = scanner.nextLine();
            if(email.equals("")){
                System.out.println("Email cannot be empty. Try again.");
                System.out.println("Enter email:");
            }
            else if(email.length() > 30){
                System.out.println("Email is too long. Try again.");
                System.out.println("Enter email:");
            }
            else{
                break;
            }
        }

        System.out.println("Enter address:");
        String address;
        while(true){
            address = scanner.nextLine();
            if(address.equals("")){
                System.out.println("Address cannot be empty. Try again.");
                System.out.println("Enter address:");
            }
            else if(address.length() > 40){
                System.out.println("Address is too long. Try again.");
                System.out.println("Enter address:");
            }
            else {
                break;
            }
        }

        System.out.println("Enter password:");
        String password;
        while (true){
            password = scanner.nextLine();
            if(password.equals("")){
                System.out.println("Password cannot be empty.");
                System.out.println("Enter password:");
            }else{
                break;
            }
        }

        System.out.println("Enter isAdmin(true or false):");
        String isAdmin;
        while(true){
            isAdmin = scanner.nextLine();
            if(isAdmin.equals("") || (!isAdmin.equals("true") && !isAdmin.equals("false"))){
                System.out.println("Please enter a valid isAdmin");
                System.out.println("Enter isAdmin(true or false):");
            }
            else{
                break;
            }
        }

        StringBuilder newUserDetails = new StringBuilder(username);
        newUserDetails.append(":::").append(name).append(":::").append(surname).append(":::").append(birthdate).append(":::")
                .append(gender).append(":::").append(email).append(":::").append(address).append(":::")
                .append(password).append(":::").append(isAdmin); //Changing the output string to the correct from
        sendMessage("ADDUSER:::" + newUserDetails.toString()); //Sending the output string to the Socket
        String response = readMessage(); //Reading from the Socket
        System.out.println(response);
    }

    public boolean userExists(String username){
        if(username == ""){return false;}
        sendMessage("USERCHECK:::" + username);
        String dummyString = readMessage();
        if(dummyString.contains("not")){
            return false;
        }
        return true;
    }


    //Update user function that updates a certain user by admins
    public void updateUser() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Username of the user that you want to update:");
        String username;
        String response;
        while (true){
            username = scanner.nextLine();
            if(!userExists(username)){
                System.out.println("Username does not exists. Try again.");
                System.out.println("Username of the user that you want to update:");
            }
            else{
                break;
            }
        }
        String action;
        System.out.println("Please enter the feature that you want to update:");
        while(true){
            action = scanner.nextLine();
            if(action.equals("name") || action.equals("surname") || action.equals("birthdate")
                    || action.equals("gender") || action.equals("email") || action.equals("address") || action.equals("password") || action.equals("isAdmin")){
                break;
            }
            else{
                System.out.println("Invalid feature. Try again.");
                System.out.println("Please enter the feature that you want to update:");
            }
        }
        switch(action){
            case "name":
                System.out.println("Enter name:");
                String name;
                while(true){
                    name = scanner.nextLine();
                    if(name.equals("")){
                        System.out.println("Name cannot be empty. Try again.");
                        System.out.println("Enter name:");
                    }
                    else if(name.length() > 20){
                        System.out.println("Name is too long. Try again.");
                        System.out.println("Enter name:");
                    }
                    else{
                        break;
                    }
                }
                sendMessage("UPDATEUSER:::" + "NAME:::" + username + ":::" + name);
                break;
            case "surname":
                System.out.println("Enter surname:");
                String surname;
                while (true){
                    surname = scanner.nextLine();
                    if(surname.equals("")){
                        System.out.println("Surname cannot be empty. Try again.");
                        System.out.println("Enter surname:");
                    }
                    else if(surname.length() > 20){
                        System.out.println("Surname is too long. Try again.");
                        System.out.println("Enter surname:");
                    }
                    else {
                        break;
                    }
                }
                sendMessage("UPDATEUSER:::" + "SURNAME:::" + username + ":::" + surname);
                break;
            case "birthdate":
                System.out.println("Enter birthdate (DD-MM-YYYY):");
                String birthdate;
                while(true){
                    birthdate = scanner.nextLine();
                    if(validBirthdate(birthdate)){
                        if(birthdate.equals("")){
                            System.out.println("Birth date cannot be empty. Try again.");
                            System.out.println("Enter birthdate (DD-MM-YYYY):");
                        }
                        else{
                            break;
                        }
                    }
                    else{
                        System.out.println("Invalid birthdate. Try again.");
                        System.out.println("Enter birthdate (DD-MM-YYYY):");
                    }
                }
                sendMessage("UPDATEUSER:::" + "BIRTHDATE:::" + username +":::" + birthdate);
                break;
            case "email":
                System.out.println("Enter email:");
                String email;
                while(true){
                    email = scanner.nextLine();
                    if(email.equals("")){
                        System.out.println("Email cannot be empty. Try again.");
                        System.out.println("Enter email:");
                    }
                    else if(email.length() > 30){
                        System.out.println("Email is too long. Try again.");
                        System.out.println("Enter email:");
                    }
                    else{
                        break;
                    }
                }
                sendMessage("UPDATEUSER:::" + "EMAIL:::" + username +":::" + email);
                break;
            case "address":
                System.out.println("Enter address:");
                String address;
                while(true){
                    address = scanner.nextLine();
                    if(address.equals("")){
                        System.out.println("Address cannot be empty. Try again.");
                        System.out.println("Enter address:");
                    }
                    else if(address.length() > 40){
                        System.out.println("Address is too long. Try again.");
                        System.out.println("Enter address:");
                    }
                    else {
                        break;
                    }
                }
                sendMessage("UPDATEUSER:::" + "ADDRESS:::" + username +":::" + address);
                break;
            case "password":
                System.out.println("Enter password:");
                String password;
                while (true){
                    password = scanner.nextLine();
                    if(password.equals("")){
                        System.out.println("Password cannot be empty.");
                        System.out.println("Enter password:");
                    }else{
                        break;
                    }
                }
                sendMessage("UPDATEUSER:::" + "PASSWORD:::" + username +":::" + password);
                break;
            case "isAdmin":
                System.out.println("Enter isAdmin(true or false):");
                String isAdmin;
                while(true){
                    isAdmin = scanner.nextLine();
                    if(isAdmin.equals("") || (!isAdmin.equals("true") && !isAdmin.equals("false"))){
                        System.out.println("Please enter a valid isAdmin");
                        System.out.println("Enter isAdmin(true or false):");
                    }
                    else{
                        break;
                    }
                }
                sendMessage("UPDATEUSER:::" + "ISADMIN:::" + username +":::" + isAdmin);
                break;
            case "gender":
                System.out.println("Enter gender (M or F):");
                String gender;
                while(true){
                    gender = scanner.nextLine();
                    if(gender.equals("") || (!gender.equals("M") && !gender.equals("F"))){
                        System.out.println("Please enter a valid gender");
                        System.out.println("Enter gender (M or F):");
                    }
                    else {
                        break;
                    }
                }
                sendMessage("UPDATEUSER:::" + "GENDER:::" + username +":::" + gender + ":::");
                break;
            default:
                System.out.println("Invalid feature. Try again.");
        }
        response = readMessage();
        System.out.println(response);
        if(this.username.equals(username)){
            System.out.println("Logging out due to self update");
            logout();
        }
    }


    //Remove user function that removes a user from the table by admins
    public void removeUser() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Enter username of the user to remove:");
        String userToRemove;
        while(true){
            userToRemove = scanner.nextLine();
            if(userToRemove.equals("")){
                System.out.println("Username cannot be empty. Try again.");
                System.out.println("Enter username of the user to remove:");
            }
            else{
                if(userExists(userToRemove)){
                    sendMessage("REMOVEUSER:::" + userToRemove); //Sending the output string to the Socket
                    String response = readMessage();
                    System.out.println(response);
                    break;
                }
                else{
                    System.out.println("Username " + userToRemove + " does not exist. Try again.");
                    System.out.println("Enter username of the user to remove:");
                }
            }
        }
    }

    //List user function that lists all users to an admin
    public void listUsers() {
        sendMessage("LISTUSERS:::" + username); //Sending the output string to the Socket
        String response = readMessage(); //Reading from the Socket
        StringBuilder listString = new StringBuilder();
        listString.append(String.format("%-20s %-20s %-20s %-15s %-15s %-30s %-40s %-10s\n",
                "Username", "Name", "Surname", "Birthdate", "Gender", "Email", "Address", "isAdmin"));
        listString.append("-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n");
        String[] individuals = response.split(":::");
        for( int i = 0; i < (individuals.length)/8; i++){
            listString.append(String.format("%-20s %-20s %-20s %-15s %-15s %-30s %-40s %-10s\n",
                    individuals[8*i],
                    individuals[8*i + 1],
                    individuals[8*i + 2],
                    individuals[8*i + 3],
                    individuals[8*i + 4],
                    individuals[8*i + 5],
                    individuals[8*i + 6],
                    individuals[8*i + 7]));
            listString.append("-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n");
        }
        System.out.println(listString.toString());
    }

    //Send message function allows users to message to each other
    public void sendMessage() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Enter receiver username:");
        String receiver;
        while(true){
            receiver = scanner.nextLine();
            if(receiver.equals("")){
                System.out.println("Receiver cannot be empty.");
                System.out.println("Enter receiver username:");
            }
            else{
                if(!userExists(receiver)){
                    System.out.println("Username does not exists. Try again.");
                    System.out.println("Enter receiver username:");
                }
                else{
                    break;
                }
            }
        }
        System.out.println("Enter message title:");
        String title;
        while(true){
            title = scanner.nextLine();
            if(title.equals("")){
                System.out.println("Title cannot be empty.");
                System.out.println("Enter message title:");
            }
            else{
                break;
            }
        }
        System.out.println("Enter message body:");
        String body;
        while(true){
            body = scanner.nextLine();
            if(body.equals("")){
                System.out.println("Message cannot be empty.");
            }
            else {
                break;
            }
        }
        String message = "SENDMSG:::" +
                username + ":::" +
                receiver + ":::" +
                title + ":::" +
                body;
        sendMessage(message); //Sending the output string to the Socket
        String response = readMessage(); //Reading from the Socket
        System.out.println(response);
    }

    public void checkInboxOrOutbox(boolean inboxFlag){
        if(inboxFlag){
            sendMessage("INBOX:::");
        }
        else{
            sendMessage("OUTBOX:::");
        }
        String response = readMessage(); //Reading from the Socket
        if(response.startsWith("NO MESSAGE FOUND")){
            System.out.println(response);
        }
        else{
            StringBuilder listString = new StringBuilder();
            listString.append(String.format("%-20s %-20s %-15s %20s %-30s\n",
                    "SENDER", "RECEIVER", "TITLE", "TIME", "MESSAGE"));
            listString.append("--------------------------------------------------------------------------------------------------\n");
            String[] individuals = response.split(":::");
            for( int i = 0; i < (individuals.length/5); i++){

                listString.append(String.format("%-20s %-20s %-15s %20s %-30s\n",
                        individuals[5*i + 0],
                        individuals[5*i + 1],
                        individuals[5*i + 2],
                        individuals[5*i + 3],
                        individuals[5*i + 4]));
                listString.append("--------------------------------------------------------------------------------------------------\n");
            }
            if(inboxFlag){
                System.out.println("INBOX:");
            }
            else {
                System.out.println("OUTBOX:");
            }
            System.out.println(listString.toString());
        }
    }

    //Send Message function that sends the output string to the socket;
    private void sendMessage(String message) {
        out.println(message);
    }

    //ReadMessage function that read the input string from the socket;
    private String readMessage() {
        try {
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) { //This loop allows readMessage to read inputs with multiple lines and breaks when it reads the END_OF_MESSAGE sign
                if (line.equals("END_OF_MESSAGE")) {
                    break;
                }
                else if(line.startsWith("You have been")){
                    System.out.println(line);
                    System.exit(0);
                }

                response.append(line).append("\n");
            }
            return response.toString();
        } catch (IOException ex) {
            ex.printStackTrace();
        }
        return null;
    }


    //Main function that runs when a client connects
    public static void main(String[] args) {
        Client client = new Client("localhost", 8581);
        while (true) { //This loop allows users to do actions until they exit
            client.login();
        }
    }
}
