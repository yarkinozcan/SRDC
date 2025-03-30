package com.srdc.messageApplication.server;
import com.srdc.messageApplication.database.Database;
import com.srdc.messageApplication.models.Message;
import com.srdc.messageApplication.models.User;

import java.io.*;
import java.net.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.sql.Timestamp;
import java.util.Calendar;


/**
 * ServerThread class handles client connections and requests on the server.
 * Each client connection is handled in a separate thread.
 */
public class ServerThread extends Thread {
    private Socket socket;
    private Database db;
    private static List<ServerThread> clients = new ArrayList<>();
    private BufferedReader input;
    private PrintWriter output;
    private String currentUsername = null;
    //private volatile boolean running = true;

    /**
     * Constructor to initialize the server thread with a client socket.
     * @param socket the client socket
     */
    public ServerThread(Socket socket) { //Constructor
        this.socket = socket;
        this.db = new Database();
        clients.add(this);
        try {
            input = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            output = new PrintWriter(socket.getOutputStream(), true);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * The run method is executed when the thread is started. It continuously reads
     * messages from the client and handles requests accordingly.
     */
    @Override
    public void run() { // Overrided run function that takes the input from the socket and after running the appropriate functions, writes the output to socket
        try {
            String message;
            while ((message = input.readLine()) != null) { //Until no input is read from the socket, continue
                String response = handleRequest(message);
                output.println(response);
            }
        }  catch (SocketException e) {
            System.out.println("Client disconnected");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Handles client requests by parsing the input message and calling the appropriate method.
     * @param message the input message from the client
     * @return the response to be sent to the client
     */
    private String handleRequest(String message) {
        String[] parts = message.split(":::"); //Split the input string
        String action = parts[0];
        switch (action) { //Run the corresponding function based on the action
            case "LOGIN":
                return handleLogin(parts[1], parts[2]);
            case "LOGOUT":
                return handleLogout();
            case "ADDUSER":
                try{
                    SimpleDateFormat sdf1 = new SimpleDateFormat("dd-MM-yyyy");
                    java.util.Date date = sdf1.parse(parts[4]);
                    java.sql.Date birthdate = new java.sql.Date(date.getTime());
                    User user = new User(parts[1],parts[2],parts[3],
                            birthdate,parts[6],
                            parts[7],Boolean.parseBoolean(parts[9]),
                            parts[5],parts[8]);
                    return handleAddUser(user);
                }
                catch (ParseException e){
                    String response = "ERROR: Invalid date.";
                    return response + "\nEND_OF_MESSAGE";
                }
            case "UPDATEUSER":
                String feature = parts[1];
                User user = db.getUserWithUsername(parts[2]);
                switch (feature){
                    case "NAME":
                        String name = parts[3];
                        user.setName(name);
                        break;
                    case "SURNAME":
                        String surname = parts[3];
                        user.setSurname(surname);
                        break;
                    case "EMAIL":
                        String email = parts[3];
                        user.setEmail(email);
                        break;
                    case "PASSWORD":
                        String password = parts[3];
                        user.setPassword(password);
                        break;
                    case "BIRTHDATE":
                        try {
                            SimpleDateFormat sdf1 = new SimpleDateFormat("dd-MM-yyyy");
                            java.util.Date date = sdf1.parse(parts[3]);
                            java.sql.Date birthdate = new java.sql.Date(date.getTime());
                            user.setBirthdate(birthdate);
                        } catch (ParseException e){
                            String response = "ERROR: Invalid date.";
                            return response + "\nEND_OF_MESSAGE";
                        }
                        break;
                    case "ADDRESS":
                        String address = parts[3];
                        user.setAddress(address);
                        break;
                    case "ISADMIN":
                        boolean isAdmin = Boolean.parseBoolean(parts[3]);
                        user.setisAdmin(isAdmin);
                        break;
                    case "GENDER":
                        String gender = parts[3];
                        user.setGender(gender);
                        break;
                }
                return handleUpdateUser(user);
            case "REMOVEUSER":
                return handleRemoveUser(parts[1]);
            case "LISTUSERS":
                return handleListUsers();
            case "SENDMSG":
                String sender = parts[1];
                String receiver = parts[2];
                String title = parts[3];
                String body = parts[4];
                Timestamp timestamp = new Timestamp(System.currentTimeMillis());
                Calendar cal = Calendar.getInstance();
                cal.setTime(timestamp);
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);
                Timestamp modifiedTimestamp = new Timestamp(cal.getTime().getTime());
                Message msg = new Message(sender,receiver,body,title,modifiedTimestamp);
                return handleSendMessage(msg);
            case "INBOX":
                return handleInboxOrOutbox(true);
            case "OUTBOX":
                return handleInboxOrOutbox(false);
            case "USERCHECK":
                return userValid(parts[1]);
            default:
                return "ERROR: Unknown action";
        }
    }


    /**
     * Checks if a user exists in the database.
     * @param username the username to check
     * @return the response indicating if the user is valid or not
     */
    private String userValid(String username) {
        if(db.validUser(username)){
            String response = "User " + username + " found!";
            return response + "\nEND_OF_MESSAGE";
        }
        else{
            String response = "User " + username + " not found!";
            return response + "\nEND_OF_MESSAGE";
        }
    }

    /**
     * Handles the login action.
     * @param username the username
     * @param password the password
     * @return the response indicating if the login was successful or not
     */
    private String handleLogin(String username, String password) {
        if (db.validateUser(username, password)) {//Checks if the login information is valid
            currentUsername = username;
            if(db.isAdmin(username)){//Checks if the login information belongs to an admin
                String response = "LOGIN successful for admin: " + username;
                return response + "\nEND_OF_MESSAGE";
            }
            String response = "LOGIN successful for user: " + username;
            return response + "\nEND_OF_MESSAGE";
        } else {
            String response = "Wrong username or password!";
            return response + "\nEND_OF_MESSAGE";
        }
    }

    /**
     * Handles the logout action.
     * @return the response indicating if the logout was successful or not
     */
    private String handleLogout() {
        if(db.isAdmin(currentUsername)){//Checks if the user that is trying to log out is an admin
            String response = "LOGOUT successful for admin: " + currentUsername;
            currentUsername = null;
            return response + "\nEND_OF_MESSAGE";
        }
        else{
            String response = "LOGOUT successful for user: " + currentUsername;
            currentUsername = null;
            return response + "\nEND_OF_MESSAGE";
        }
    }

    /**
     * Handles the add user action.
     * @param user the user to be added
     * @return the response indicating if the add action was successful or not
     */
    private String handleAddUser(User user) {
        db.addUser(user);
        String response = "ADDUSER successful for user: " + user.getuserName();
        return response + "\nEND_OF_MESSAGE";
    }


    /**
     * Handles the update user action.
     * @param user the user to be updated
     * @return the response indicating if the update action was successful or not
     */
    private String handleUpdateUser(User user) {
        String username  = user.getuserName();
        db.updateUser(user);
        String response = "UPDATEUSER successful for user: " + username;
        return response + "\nEND_OF_MESSAGE";
    }


    /**
     * Handles the remove user action.
     * @param username the username of the user to be removed
     * @return the response indicating if the remove action was successful or not
     */
    private String handleRemoveUser(String username) {
        db.removeUser(username);
        for (ServerThread client : clients) {
            if (client.getUsername() != null && client.getUsername().equals(username)) {
                if (client.socket.isConnected()) {
                    client.output.println("You have been removed by the admin.");
                    clients.remove(client);
                }
                break;
            }
        }
        String response = "REMOVEUSER successful for user: " + username;
        return response + "\nEND_OF_MESSAGE";
    }

    /**
     * Retrieves the username associated with this thread.
     * @return the username
     */
    private String getUsername() {
        // Implementation to retrieve the username associated with this thread
        return currentUsername; // placeholder
    }


    /**
     * Handles the list users action.
     * @return the response listing all users
     */
    private String handleListUsers() {
        List<User> users = db.listUsers();
        StringBuilder response = new StringBuilder();
        for(User user : users) {
            response.append(user.getuserName()).append(":::")
                    .append(user.getName()).append(":::")
                    .append(user.getSurname()).append(":::")
                    .append(user.getBirthdate().toString()).append(":::")
                    .append(user.getGender()).append(":::")
                    .append(user.getEmail()).append(":::")
                    .append(user.getAddress()).append(":::")
                    .append(user.getisAdmin()).append(":::");
        }
        response.append("\nEND_OF_MESSAGE");
        return response.toString();
    }


    /**
     * Handles the send message action.
     * @param msg the message to be sent
     * @return the response indicating if the send action was successful or not
     */
    private String handleSendMessage(Message msg) {
        db.sendMessage(msg);
        String response = "SENDMSG successful from " + msg.getSender() + " to " + msg.getReceiver();
        return response + "\nEND_OF_MESSAGE";
    }


    /**
     * Handles the inbox action.
     * @return the response listing all inbox messages
     */

    private String handleInboxOrOutbox(boolean inboxFlag){
        List<Message> messages = db.inboxOrOutbox(currentUsername,inboxFlag);
        StringBuilder response;
        if(inboxFlag){response = new StringBuilder();}
        else{response = new StringBuilder();}
        if(messages.size() == 0){
            response.append("NO MESSAGE FOUND\n");
        }
        else{
            for (Message message : messages) {
                if(db.validUser(message.getSender())){
                    response.append(message.getSender()).append(":::");
                }
                else{
                    response.append(message.getSender()).append(" (Deleted User)").append(":::");
                }
                if(db.validUser(message.getReceiver())){
                    response.append(message.getReceiver()).append(":::");
                }
                else{
                    response.append(message.getReceiver()).append(" (Deleted User)").append(":::");
                }
                response.append(message.getTitle()).append(":::")
                        .append(timeStampParser(String.valueOf(message.getTimestamp()))).append(":::")
                        .append(message.getMessageBody()).append(":::");
            }
        }
        response.append("\nEND_OF_MESSAGE");
        return response.toString();
    }

    /**
     * Parses the timestamp to a simpler format.
     * @param timeStamp the original timestamp
     * @return the parsed timestamp
     */
    private String timeStampParser(String timeStamp) {
        String[] parts = timeStamp.split(":");
        return parts[0] + ":" + parts[1];
    }
}
