package com.srdc.messageApplication.database;

import com.srdc.messageApplication.models.Message;
import com.srdc.messageApplication.models.User;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class Database {
    private Connection conn = null;
    /**
     * Establishes a connection to the database.
     * @return the database connection
     */
    public Database() {
        String url = "jdbc:postgresql://localhost:5432/postgres";
        String user = "postgres";
        String password = "6642";
       conn = null;
        try {
            conn = DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * Adds a new user to the database.
     * @param user the user to be added
     */
    public void addUser(User user) {
        String SQL = "INSERT INTO users(username, name, surname, birthdate, gender, email, address, password, isAdmin) VALUES(?,?,?,?,?,?,?,?,?)";
        try (PreparedStatement pstmt = conn.prepareStatement(SQL)) {
            pstmt.setString(1, user.getuserName());
            pstmt.setString(2, user.getName());
            pstmt.setString(3, user.getSurname());
            pstmt.setDate(4, user.getBirthdate());
            pstmt.setString(5, user.getGender());
            pstmt.setString(6, user.getEmail());
            pstmt.setString(7, user.getAddress());
            pstmt.setString(8, user.getPassword());
            pstmt.setBoolean(9, user.getisAdmin());
            pstmt.executeUpdate();
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
    }

    /**
     * Updates an existing user in the database.
     * @param user the user to be updated
     */
    public void updateUser(User user) {
        String SQL = "UPDATE users SET name=?, surname=?, birthdate=?, gender=?, email=?, address=?, password=?, isAdmin=? WHERE username=?";
        try (PreparedStatement pstmt = conn.prepareStatement(SQL)) {
            pstmt.setString(1, user.getName());
            pstmt.setString(2, user.getSurname());
            pstmt.setDate(3, user.getBirthdate());
            pstmt.setString(4, user.getGender());
            pstmt.setString(5, user.getEmail());
            pstmt.setString(6, user.getAddress());
            pstmt.setString(7, user.getPassword());
            pstmt.setBoolean(8, user.getisAdmin());
            pstmt.setString(9, user.getuserName());
            pstmt.executeUpdate();
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
    }

    /**
     * Removes a user from the database and updates related messages.
     * @param username the username of the user to be removed
     */
    public void removeUser(String username) {
        // Delete the user
        String query = "DELETE FROM users WHERE username = ?";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, username);
            stmt.executeUpdate();
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
    }

    /**
     * Lists all users from the database.
     * @return a list of all users
     */
    public List<User> listUsers() {
        String SQL = "SELECT * FROM users";
        List<User> users = new ArrayList<>();
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(SQL)) {
            while (rs.next()) {
                User user = new User(
                        rs.getString("username"),
                        rs.getString("name"),
                        rs.getString("surname"),
                        rs.getDate("birthdate"),
                        rs.getString("email"),
                        rs.getString("address"),
                        rs.getBoolean("isAdmin"),
                        rs.getString("gender"),
                        rs.getString("password")
                );
                users.add(user);
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return users;
    }


    /**
     * Sends a message by inserting it into the messages table.
     * @param msg the message to be sent
     */
    public void sendMessage(Message msg) {
        String SQL = "INSERT INTO messages(sender, receiver, title, body, timestamp) VALUES(?, ?, ?, ?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(SQL)) {
            pstmt.setString(1, msg.getSender());
            pstmt.setString(2, msg.getReceiver());
            pstmt.setString(3, msg.getTitle());
            pstmt.setString(4, msg.getMessageBody());
            pstmt.setTimestamp(5, msg.getTimestamp());
            pstmt.executeUpdate();
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
    }

    /**
     * Retrieves all messages for a specific user (inbox).
     * @param username the username of the user
     * @return a list of messages received by the user
     */

    public List<Message> inboxOrOutbox(String username, boolean inboxFlag) {
        String SQL;
        List<Message> messages = new ArrayList<>();
        if(inboxFlag) {
            SQL = "SELECT * FROM messages WHERE receiver=?";
        }
        else{
            SQL = "SELECT * FROM messages WHERE sender=?";
        }
        try (PreparedStatement pstmt = conn.prepareStatement(SQL)) {
            pstmt.setString(1, username);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Message message = new Message(
                            rs.getString("sender"),
                            rs.getString("receiver"),
                            rs.getString("body"),
                            rs.getString("title"),
                            rs.getTimestamp("timestamp")
                    );
                    messages.add(message);
                }
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return messages;
    }

    /**
     * Validates if a username and password combination exists in the database.
     * @param username the username to validate
     * @param password the password to validate
     * @return true if the combination is valid, false otherwise
     */
    public boolean validateUser(String username, String password) {
        String SQL = "SELECT COUNT(*) FROM users WHERE username=? AND password=?";
        try (PreparedStatement pstmt = conn.prepareStatement(SQL)) {
            pstmt.setString(1, username);
            pstmt.setString(2, password);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next() && rs.getInt(1) == 1) {
                    return true;
                }
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return false;
    }

    /**
     * Checks if a username exists in the database.
     * @param username the username to check
     * @return true if the username exists, false otherwise
     */
    public boolean validUser(String username) {
        String SQL = "SELECT COUNT(*) FROM users WHERE username=?";
        try (PreparedStatement pstmt = conn.prepareStatement(SQL)){
            pstmt.setString(1, username);
            try(ResultSet rs = pstmt.executeQuery()) {
                if(rs.next() && rs.getInt(1) == 1){
                    return true;
                }
                else{
                    return false;
                }
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return false;
    }

    /**
     * Retrieves a user by username from the database.
     * @param username the username of the user
     * @return the user object, or null if not found
     */
    public User getUserWithUsername(String username) {
        String SQL = "SELECT * FROM users WHERE username=?";
        try (PreparedStatement pstmt = conn.prepareStatement(SQL)) {
            pstmt.setString(1, username);
            try (ResultSet rs = pstmt.executeQuery()){
                rs.next();
                User user = new User(
                        rs.getString("username"),
                        rs.getString("name"),
                        rs.getString("surname"),
                        rs.getDate("birthdate"),
                        rs.getString("email"),
                        rs.getString("address"),
                        rs.getBoolean("isAdmin"),
                        rs.getString("gender"),
                        rs.getString("password")
                );
                return user;
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return null;
    }

    /**
     * Checks if a username exists in the database.
     * @param username the username to check
     * @return true if the username exists, false otherwise
     */
    public boolean usernameExists(String username) {
        String SQL = "SELECT COUNT(*) FROM users WHERE username=?";
        try (PreparedStatement pstmt = conn.prepareStatement(SQL)) {
            pstmt.setString(1, username);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next() && rs.getInt(1) == 1) {
                    return true;
                }
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return false;
    }

    /**
     * Checks if a user is an admin.
     * @param username the username to check
     * @return true if the user is an admin, false otherwise
     */
    public boolean isAdmin(String username) {
        String SQL = "SELECT isAdmin FROM users WHERE username=?";
        try (PreparedStatement pstmt = conn.prepareStatement(SQL)) {
            pstmt.setString(1, username);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next() && rs.getBoolean("isAdmin")) {
                    return true;
                }
                else{
                    return false;
                }
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
        return false;
    }


}
